import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { ModelOperation } from '../types/dmmf.type';
import { GeneratorOptions } from '../types/generator.type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSchemaArgDeclaration } from '../helpers/declaration/get-schema-arg-declaration';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';
import { generatePropertyTypes } from './generate-property-types';

export function generateArgsType(
  project: ProjectStructure,
  options: GeneratorOptions,
  operation: ModelOperation,
  modelName: string
) {
  const { argsTypeName, schemaField } = operation;
  const { args } = schemaField;
  const { srcPath } = options;
  const sourceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    argsTypeName,
    'Args'
  );
  if (project.isSourceFileExists(sourceFilePath)) {
    return;
  }

  project.createSourceFile(sourceFilePath);

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['ArgsType', 'Field'],
    },
  ];
  const properties: PropertyDeclarationStructure[] = [];

  for (const field of args) {
    const { imports: propertyImports, property } = getSchemaArgDeclaration(
      sourceFilePath,
      options,
      field
    );
    imports.push(...propertyImports);
    properties.push(property);
  }

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: argsTypeName,
    isExported: true,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'ArgsType',
        arguments: [],
      },
    ],
    properties,
  };
  project.setSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [
      GENERATED_WARNING_COMMENT,
      ...optimizeImports(imports, argsTypeName),
      classDeclaration,
    ],
  });

  generatePropertyTypes(project, options, args);
}
