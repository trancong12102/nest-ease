import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  MethodDeclarationStructure,
  OptionalKind,
  ParameterDeclarationStructure,
  Scope,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { ModelMapping } from '../types/dmmf.type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { getPropertyType } from '../helpers/type/get-property-type';
import { getResolveMethodName } from '../helpers/generator/get-resolve-method-name';
import { getGraphqlType } from '../helpers/type/get-graphql-type';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getFieldPropertyDeclaration } from '../helpers/declaration/get-field-property-declaration';
import { getFieldGraphqlDeclaration } from '../helpers/declaration/get-field-graphql-declaration';
import { getModuleFileClassName } from '../helpers/path/get-module-file-class-name';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export function generateModelBaseResolver(
  project: ProjectStructure,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const { srcPath, dmmf } = generatorOptions;
  const { model, operations } = modelMapping;
  const { name: modelName } = model;
  const className = getModuleFileClassName(modelName, 'Resolver', true);
  const sourceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    className,
    'Resolver'
  );
  project.createSourceFile(sourceFilePath);

  const baseServiceClassName = getModuleFileClassName(
    modelName,
    'Service',
    true
  );
  const baseServiceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    baseServiceClassName,
    'Service'
  );
  const modelFilePath = getSourceFilePath(
    srcPath,
    modelName,
    modelName,
    'Model'
  );

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        baseServiceFilePath
      ),
      namedImports: [baseServiceClassName],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['Resolver', 'Query', 'Mutation', 'Args'],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(sourceFilePath, modelFilePath),
      namedImports: [modelName],
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
      resolverMethod,
      type: operationType,
    } = operation;
    const {
      property: { type: propertyType },
      imports: propertyImports,
    } = getFieldPropertyDeclaration({
      name: resolverMethod,
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
    const { imports: graphqlImports, type: graphqlType } =
      getFieldGraphqlDeclaration({
        type,
        location,
        isList,
        importDest: sourceFilePath,
        generatorOptions,
      });

    imports.push(...propertyImports, ...graphqlImports);

    const argsTypeFilePath = getSourceFilePath(
      srcPath,
      modelName,
      argsTypeName,
      'Args'
    );
    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        argsTypeFilePath
      ),
      namedImports: [argsTypeName],
    });
    methods.push({
      kind: StructureKind.Method,
      name: resolverMethod,
      isAsync: true,
      returnType: propertyType,
      parameters: [
        {
          kind: StructureKind.Parameter,
          name: 'args',
          type: argsTypeName,
          decorators: [
            {
              kind: StructureKind.Decorator,
              name: 'Args',
              arguments: [],
            },
          ],
        },
      ],
      statements: [`return this.service.${serviceMethod}(args);`],
      decorators: [
        {
          kind: StructureKind.Decorator,
          name: operationType,
          arguments: [`() => ${graphqlType}, { nullable: ${isNullable} }`],
        },
      ],
    });
  }

  const relations = model.fields.filter((f) => f.relationName);
  if (relations.length > 0) {
    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['Parent', 'ResolveField'],
    });
  }

  for (const relation of relations) {
    const { type: relationModelName, isList, isRequired, name } = relation;
    const relationModule =
      dmmf.getModelNameOfType(relationModelName, 'Model') || 'Prisma';
    const relationModelFilePath = getSourceFilePath(
      srcPath,
      relationModule,
      relationModelName,
      'Model'
    );
    const graphqlType = getGraphqlType(relationModelName, isList);
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
        decorators: [
          {
            kind: StructureKind.Decorator,
            name: 'Parent',
            arguments: [],
          },
        ],
      },
    ];
    if (isList) {
      const findManyArgsType = `${relationModelName}FindManyArgs`;
      const findManyArgsTypeFilePath = getSourceFilePath(
        srcPath,
        relationModelName,
        findManyArgsType,
        'Args'
      );
      parameters.push({
        kind: StructureKind.Parameter,
        name: 'args',
        type: findManyArgsType,
        decorators: [
          {
            kind: StructureKind.Decorator,
            name: 'Args',
            arguments: [],
          },
        ],
      });
      imports.push({
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: getImportModuleSpecifier(
          sourceFilePath,
          findManyArgsTypeFilePath
        ),
        namedImports: [findManyArgsType],
      });
    }

    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        relationModelFilePath
      ),
      namedImports: [relationModelName],
    });
    methods.push({
      kind: StructureKind.Method,
      name,
      parameters,
      decorators: [
        {
          kind: StructureKind.Decorator,
          name: 'ResolveField',
          arguments: [`() => ${graphqlType}, { nullable: ${!isRequired} }`],
        },
      ],
      returnType: propertyType,
      statements: [
        `
return this.service.${getResolveMethodName(name)}(parent${
          isList ? ', args' : ''
        });
        `,
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
            name: 'service',
            type: baseServiceClassName,
            isReadonly: true,
            scope: Scope.Protected,
          },
        ],
      },
    ],
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'Resolver',
        arguments: [`() => ${modelName}`],
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
