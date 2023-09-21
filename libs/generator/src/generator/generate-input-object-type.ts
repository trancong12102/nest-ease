import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { FieldNamespace } from '../types/dmmf.type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSchemaArgDeclaration } from '../helpers/declaration/get-schema-arg-declaration';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { generatePropertyTypes } from './generate-property-types';
import { ProjectStructure } from '../helpers/project-structure/project-structure';
import { logger, stylize } from '../utils/logger';

export function generateInputObjectType(
  project: ProjectStructure,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  inputTypeName: string
) {
  const { dmmf, srcPath } = options;

  const module = dmmf.getModelNameOfInputType(inputTypeName) || 'Prisma';

  const sourceFilePath = getSourceFilePath(
    srcPath,
    module,
    inputTypeName,
    'Input'
  );
  if (project.isSourceFileExists(sourceFilePath)) {
    return;
  }
  project.createSourceFile(sourceFilePath);

  const type = dmmf.getNonPrimitiveType(
    'inputObjectTypes',
    namespace,
    inputTypeName
  );
  if (!type) {
    throw new Error(`Cannot find input type ${inputTypeName}`);
  }
  const { fields } = type;

  if (
    !dmmf.getIsNonPrimitiveTypeChanged(
      'inputObjectTypes',
      namespace,
      inputTypeName
    )
  ) {
    logger.info(stylize(`Skipping unchanged input ${inputTypeName}`, 'dim'));
    generatePropertyTypes(project, options, fields);
    return;
  }
  logger.info(stylize(`Generating input type ${inputTypeName}...`, 'dim'));

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['InputType', 'Field'],
    },
  ];
  const properties: PropertyDeclarationStructure[] = [];

  const isNestedInputType = getIsNestedInputType(inputTypeName);

  for (const field of fields) {
    const { imports: propertyImports, property } = getSchemaArgDeclaration(
      sourceFilePath,
      options,
      field,
      {
        isInNestedInputType: isNestedInputType,
      }
    );
    imports.push(...propertyImports);
    properties.push(property);
  }

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: inputTypeName,
    isExported: true,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'InputType',
        arguments: [],
      },
    ],
    properties,
  };

  project.setSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [
      GENERATED_WARNING_COMMENT,
      ...optimizeImports(imports, inputTypeName),
      classDeclaration,
    ],
  });

  generatePropertyTypes(project, options, fields);
}

function getIsNestedInputType(inputType: string) {
  return /.*?Nested.*?Input$/.test(inputType);
}
