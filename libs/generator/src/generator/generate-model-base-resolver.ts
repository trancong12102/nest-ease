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
import { ModelMapping } from '../types/dmmf';
import { getBaseChildFilePath } from '../helpers/path/get-base-child-file-path';
import { getClassname } from '../helpers/path/get-classname';
import { BaseFileKind } from '../enums/base-file-kind';
import { CodeComment } from '../enums/code-comment';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { getFieldMetadata } from '../helpers/generator/get-field-metadata';
import { getPropertyType } from '../helpers/generator/get-property-type';
import { getResolveMethodName } from '../helpers/generator/get-resolve-method-name';
import { getGraphqlType } from '../helpers/generator/get-graphql-type';
import { camelCase } from 'case-anything';

export function generateModelBaseResolver(
  project: Project,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const { srcPath } = generatorOptions;
  const { model, operations } = modelMapping;
  const { name: modelName } = model;
  const className = getClassname(modelName, BaseFileKind.BaseResolver);
  const sourceFilePath = getBaseChildFilePath(
    srcPath,
    className,
    BaseFileKind.BaseResolver
  );
  const baseServiceClassname = getClassname(
    modelName,
    BaseFileKind.BaseService
  );
  const baseServiceFilepath = getBaseChildFilePath(
    srcPath,
    baseServiceClassname,
    BaseFileKind.BaseService
  );

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        baseServiceFilepath
      ),
      namedImports: [baseServiceClassname],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['Resolver', 'Query', 'Mutation', 'Args'],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        getBaseChildFilePath(srcPath, modelName, BaseFileKind.Model)
      ),
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
      propertyType,
      imports: propertyImports,
      graphqlType,
    } = getFieldMetadata({
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

    const argsTypeFilepath = getBaseChildFilePath(
      srcPath,
      argsTypeName,
      BaseFileKind.Args
    );
    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        argsTypeFilepath
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
    const { type, isList, isRequired, name } = relation;
    const graphqlType = getGraphqlType(type, isList);
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
      const findManyArgsTypeClassname = `${type}FindManyArgs`;
      parameters.push({
        kind: StructureKind.Parameter,
        name: 'args',
        type: findManyArgsTypeClassname,
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
          getBaseChildFilePath(
            srcPath,
            findManyArgsTypeClassname,
            BaseFileKind.Args
          )
        ),
        namedImports: [findManyArgsTypeClassname],
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

  methods.push({
    kind: StructureKind.Method,
    name: camelCase(`${modelName}Count`),
    returnType: 'Promise<number>',
    parameters: [
      {
        kind: StructureKind.Parameter,
        name: 'args',
        type: `${modelName}FindManyArgs`,
        decorators: [
          {
            kind: StructureKind.Decorator,
            name: 'Args',
            arguments: [],
          },
        ],
      },
    ],
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'Query',
        arguments: [`() => Number`],
      },
    ],
    statements: [`return this.service.count(args);`],
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
            name: 'service',
            type: baseServiceClassname,
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

  project.createSourceFile(
    sourceFilePath,
    {
      statements: [
        CodeComment.GenratedFileComment,
        ...optimizeImports(imports, className),
        classDeclaration,
      ],
    },
    {
      overwrite: true,
    }
  );
}
