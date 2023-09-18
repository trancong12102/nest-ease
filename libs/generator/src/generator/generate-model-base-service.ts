import {
  ClassDeclarationStructure,
  CodeBlockWriter,
  ImportDeclarationStructure,
  MethodDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Project,
  Scope,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { Model, ModelMapping } from '../types/dmmf.type';
import { getBaseChildFilePath } from '../helpers/path/get-base-child-file-path';
import { getClassname } from '../helpers/path/get-classname';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { getFieldDeclaration } from '../helpers/declaration/get-field-declaration';
import { camelCase } from 'case-anything';
import { getPropertyType } from '../helpers/type/get-property-type';
import { getResolveMethodName } from '../helpers/generator/get-resolve-method-name';
import { getCompoundFieldName } from '../helpers/generator/get-compound-field-name';
import { GENERATED_FILE_COMMENT } from '../contants/comment.const';

export function generateModelBaseService(
  project: Project,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const { srcPath, prismaServicePath } = generatorOptions;
  const { model, operations } = modelMapping;
  const { name: modelName } = model;
  const modelDelegateName = camelCase(modelName);
  const className = getClassname(modelName, 'BaseService');
  const sourceFilePath = getBaseChildFilePath(
    srcPath,
    className,
    'BaseService'
  );
  const prismaServiceClassname = getClassname('Prisma', 'Service');
  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        prismaServicePath
      ),
      namedImports: [prismaServiceClassname],
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
    const { propertyType, imports: propertyImports } = getFieldDeclaration({
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
    imports.push(...propertyImports, {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        getBaseChildFilePath(srcPath, argsTypeName, 'Args')
      ),
      namedImports: [argsTypeName],
    });

    methods.push({
      kind: StructureKind.Method,
      name: serviceMethod,
      isAsync: true,
      returnType: propertyType,
      parameters: [
        {
          kind: StructureKind.Parameter,
          name: 'args',
          type: argsTypeName,
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
      const findManyArgsTypeClassname = `${type}FindManyArgs`;
      parameters.push({
        kind: StructureKind.Parameter,
        name: 'args',
        type: findManyArgsTypeClassname,
      });
      imports.push({
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: getImportModuleSpecifier(
          sourceFilePath,
          getBaseChildFilePath(srcPath, findManyArgsTypeClassname, 'Args')
        ),
        namedImports: [findManyArgsTypeClassname],
      });
    }

    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        getBaseChildFilePath(srcPath, type, 'Model')
      ),
      namedImports: [type],
    });
    methods.push({
      kind: StructureKind.Method,
      name: getResolveMethodName(name),
      parameters,
      returnType: propertyType,
      statements: [
        (writer) => {
          writer.writeLine(`
return this.prisma.client.${modelDelegateName}
.findUniqueOrThrow({
  where: ${getResolveParentWhereStatement(model)}
})
.${name}(${isList ? 'args' : ''});
        `);
        },
      ],
    });
  }

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
        GENERATED_FILE_COMMENT,
        ...optimizeImports(imports, className),
        classDeclaration,
      ],
    },
    {
      overwrite: true,
    }
  );
}

function getResolveParentWhereStatement(model: Model) {
  const { primaryKey, fields } = model;
  const writer = new CodeBlockWriter();

  if (primaryKey) {
    const compoundField = getCompoundFieldName(primaryKey);

    writer.block(() => {
      writer.write(`${compoundField}: `);
      writer.block(() => {
        for (const field of fields) {
          writer.writeLine(`${field.name}: parent.${field.name},`);
        }
      });
    });

    return writer.toString();
  }

  const idField = fields.find((f) => f.isId);
  if (!idField) {
    throw new Error(`Cannot find id field ${model.name}`);
  }

  writer.block(() => {
    writer.writeLine(`${idField.name}: parent.${idField.name},`);
  });

  return writer.toString();
}
