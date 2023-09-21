import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { ModelOperation } from '../types/dmmf.type';
import { GeneratorOptions } from '../types/generator.type';
import { selectInputType } from '../helpers/dmmf/select-input-type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { generatePrismaType } from './generate-prisma-type';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSchemaArgDeclaration } from '../helpers/declaration/get-schema-arg-declaration';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';
import { logger, stylize } from '../utils/logger';
import { generatePropertyTypes } from './generate-property-types';

export function generateArgsType(
  project: ProjectStructure,
  options: GeneratorOptions,
  operation: ModelOperation,
  modelName: string
) {
  const { argsTypeName, schemaField, type: operationType } = operation;
  const { args, name: schemaFieldName } = schemaField;
  const { srcPath, dmmf } = options;
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

  if (!dmmf.getIsSchemaFieldChanged(operationType, schemaFieldName)) {
    logger.info(stylize(`Skipping unchanged args ${argsTypeName}`, 'dim'));
    generatePropertyTypes(project, options, args);
  }

  logger.info(stylize(`Generating args type ${argsTypeName}...`, 'dim'));
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

  for (const field of args) {
    const { inputTypes } = field;
    const inputType = selectInputType(inputTypes);
    generatePrismaType(project, options, inputType);
  }

  generatePropertyTypes(project, options, args);
}
