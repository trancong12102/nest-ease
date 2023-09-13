import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  MethodDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Project,
  Scope,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator';
import { Model, ModelMapping } from '../types/dmmf';
import { getBaseChildFilePath } from '../helpers/path/get-base-child-file-path';
import { getClassname } from '../helpers/path/get-classname';
import { BaseFileKind } from '../enums/base-file-kind';
import { ModuleFileKind } from '../enums/module-file-kind';
import { CodeComment } from '../enums/code-comment';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { getFieldMetadata } from '../helpers/generator/get-field-metadata';
import { camelCase } from 'case-anything';
import { getPropertyType } from '../helpers/generator/get-property-type';
import { CommonModule } from '../enums/common-module';
import { getResolveMethodName } from '../helpers/generator/get-resolve-method-name';
import { getCompoundFieldName } from '../helpers/generator/get-compound-field-name';

export function generateModelBaseService(
  project: Project,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const {
    srcPath,
    config: {
      prisma: { servicePath: prismaServicePath, clientPath: prismaClientPath },
    },
  } = generatorOptions;
  const { model, operations } = modelMapping;
  const { name: modelName } = model;
  const modelDelegateName = camelCase(modelName);
  const className = getClassname(modelName, BaseFileKind.BaseService);
  const sourceFilePath = getBaseChildFilePath(
    srcPath,
    className,
    BaseFileKind.BaseService
  );
  const prismaServiceClassname = getClassname('prisma', ModuleFileKind.Service);
  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        prismaServicePath
      ),
      namedImports: [prismaServiceClassname],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        prismaClientPath
      ),
      namedImports: [CommonModule.Prisma],
    },
  ];
  const methods: MethodDeclarationStructure[] = [];

  for (const operation of operations) {
    const {
      argsTypeName,
      schemaField: {
        outputType: { type, namespace, isList, location },
        isNullable,
      },
      serviceMethod,
    } = operation;
    const { propertyType, imports: propertyImports } = getFieldMetadata({
      type,
      location,
      namespace,
      generatorOptions,
      importDest: sourceFilePath,
      propertyOptions: {
        isList,
        isNullable,
        fixCircular: false,
        isPromise: true,
      },
    });
    imports.push(...propertyImports);

    methods.push({
      kind: StructureKind.Method,
      name: serviceMethod,
      isAsync: true,
      returnType: propertyType,
      parameters: [
        {
          kind: StructureKind.Parameter,
          name: 'args',
          type: `Prisma.${argsTypeName}`,
        },
      ],
      statements: [
        `return this.prisma.client.${modelDelegateName}.${serviceMethod}(args);`,
      ],
    });
  }

  const relations = model.fields.filter((f) => f.relationName);
  for (const relation of relations) {
    const { type, isList, isRequired, name } = relation;
    const propertyType = getPropertyType(type, {
      isList,
      isNullable: !isRequired,
      isPromise: true,
    });

    const parameters: OptionalKind<ParameterDeclarationStructure>[] = [
      {
        kind: StructureKind.Parameter,
        name: 'parent',
        type: modelName,
      },
    ];
    if (isList) {
      parameters.push({
        kind: StructureKind.Parameter,
        name: 'args',
        type: `Prisma.${type}FindManyArgs`,
      });
    }

    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        getBaseChildFilePath(srcPath, type, BaseFileKind.Model)
      ),
      namedImports: [type],
    });
    methods.push({
      kind: StructureKind.Method,
      name: getResolveMethodName(name),
      parameters,
      returnType: propertyType,
      statements: [
        `
return this.prisma.client.${modelDelegateName}
.findUniqueOrThrow({
  where: ${getResolveParentWhere(model)}
})
.${name}(${isList ? 'args' : ''});
        `,
      ],
    });
  }

  methods.push({
    kind: StructureKind.Method,
    name: 'count',
    returnType: 'Promise<number>',
    parameters: [
      {
        kind: StructureKind.Parameter,
        name: 'args',
        type: `Prisma.${model.name}CountArgs`,
      },
    ],
    statements: [`return this.prisma.client.${modelDelegateName}.count(args);`],
  });

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: className,
    isExported: true,
    ctors: [
      {
        kind: StructureKind.Constructor,
        parameters: [
          {
            kind: StructureKind.Parameter,
            name: 'prisma',
            type: prismaServiceClassname,
            isReadonly: true,
            scope: Scope.Protected,
          },
        ],
      },
    ],
    methods,
  };

  project.createSourceFile(
    sourceFilePath,
    {
      statements: [
        CodeComment.GeneratedWarning,
        ...optimizeImports(imports, className),
        classDeclaration,
      ],
    },
    {
      overwrite: true,
    }
  );
}

function getResolveParentWhere(model: Model) {
  const { primaryKey, fields } = model;

  if (primaryKey) {
    const compoundField = getCompoundFieldName(primaryKey);
    let where = `{ ${compoundField}: { `;

    for (const field of fields) {
      where += `${field}: parent.${field}, `;
    }
    where += `}}`;

    return where;
  }

  const idField = fields.find((f) => f.isId);
  if (!idField) {
    throw new Error(`Cannot find id field ${model.name}`);
  }

  return `{ ${idField.name}: parent.${idField.name}, }`;
}
