import {
  ClassDeclarationStructure,
  CodeBlockWriter,
  ImportDeclarationStructure,
  MethodDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Scope,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { Model, ModelMapping } from '../types/dmmf.type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { camelCase } from 'case-anything';
import { getPropertyType } from '../helpers/type/get-property-type';
import { getResolveMethodName } from '../helpers/generator/get-resolve-method-name';
import { getCompoundFieldName } from '../helpers/generator/get-compound-field-name';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getFieldPropertyDeclaration } from '../helpers/declaration/get-field-property-declaration';
import { getModuleFileClassName } from '../helpers/path/get-module-file-class-name';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export function generateModelBaseService(
  project: ProjectStructure,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping,
) {
  const { srcPath, prismaServicePath } = generatorOptions;
  const { model, operations } = modelMapping;
  const { name: modelName } = model;
  const modelDelegateName = camelCase(modelName);
  const className = getModuleFileClassName(modelName, 'Service', true);
  const sourceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    className,
    'Service',
  );
  project.createSourceFile(sourceFilePath);

  const prismaServiceClassname = getModuleFileClassName('Prisma', 'Service');
  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        prismaServicePath,
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
    const {
      property: { type: propertyType },
      imports: propertyImports,
    } = getFieldPropertyDeclaration({
      name: serviceMethod,
      type,
      location,
      namespace,
      generatorOptions,
      importDest: sourceFilePath,
      propertyOptions: {
        isList,
        isNullable,
        isPromise: true,
      },
    });
    const argTypeFilePath = getSourceFilePath(
      srcPath,
      modelName,
      argsTypeName,
      'Args',
    );
    imports.push(...propertyImports, {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        argTypeFilePath,
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
    const { type: relationModelName, isList, isRequired, name } = relation;
    const relationModelFilePath = getSourceFilePath(
      srcPath,
      relationModelName,
      relationModelName,
      'Model',
    );

    const propertyType = getPropertyType(relationModelName, {
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
      const findManyArgsTypeName = `${relationModelName}FindManyArgs`;
      const findManyArgsTypeFilePath = getSourceFilePath(
        srcPath,
        relationModelName,
        findManyArgsTypeName,
        'Args',
      );
      parameters.push({
        kind: StructureKind.Parameter,
        name: 'args',
        type: findManyArgsTypeName,
      });
      imports.push({
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: getImportModuleSpecifier(
          sourceFilePath,
          findManyArgsTypeFilePath,
        ),
        namedImports: [findManyArgsTypeName],
      });
    }

    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        relationModelFilePath,
      ),
      namedImports: [relationModelName],
    });
    methods.push({
      kind: StructureKind.Method,
      name: getResolveMethodName(name),
      parameters,
      returnType: propertyType,
      isAsync: true,
      statements: [
        (writer) =>
          writeResolveRelationStatement(
            writer,
            model,
            modelDelegateName,
            name,
            isList,
          ),
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

  project.setSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [
      GENERATED_WARNING_COMMENT,
      ...optimizeImports(imports, className),
      classDeclaration,
    ],
  });
}

function writeResolveRelationStatement(
  writer: CodeBlockWriter,
  model: Model,
  modelDelegateName: string,
  resolverFieldName: string,
  isList: boolean,
) {
  writer
    .writeLine(`return this.prisma.client.${modelDelegateName}`)
    .indent(() => {
      writer
        .write('.findUniqueOrThrow(')
        .inlineBlock(() => {
          writer
            .write('where: ')
            .inlineBlock(() =>
              writeResolveRelationWhereStatement(writer, model),
            )
            .write(',');
        })
        .write(')')
        .writeLine(`.${resolverFieldName}(${isList ? 'args' : ''});`);
    });
}

function writeResolveRelationWhereStatement(
  writer: CodeBlockWriter,
  model: Model,
) {
  const { primaryKey, fields } = model;

  if (primaryKey) {
    const compoundField = getCompoundFieldName(primaryKey);

    writer
      .write(`${compoundField}: `)
      .inlineBlock(() => {
        for (const field of fields) {
          writer.writeLine(`${field.name}: parent.${field.name},`);
        }
      })
      .write(',');

    return;
  }

  const idField = fields.find((f) => f.isId);
  if (!idField) {
    throw new Error(`Cannot find id field ${model.name}`);
  }
  writer.writeLine(`${idField.name}: parent.${idField.name},`);
}
