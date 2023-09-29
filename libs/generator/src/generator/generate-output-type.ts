import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { FieldNamespace, OutputType } from '../types/dmmf.type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { buildModelDocumentations } from '../helpers/documentation/build-model-documentations';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSchemaFieldDeclaration } from '../helpers/declaration/get-schema-field-declaration';
import { TypeFileKind } from '../types/file-kind.type';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { generatePropertyTypes } from './generate-property-types';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export function generateOutputType(
  project: ProjectStructure,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  modelName: string,
) {
  const { srcPath, dmmf } = options;

  const model = dmmf.getModel(modelName);
  const { documentation, fields: fieldDocumentations } =
    buildModelDocumentations(model);
  const kind: TypeFileKind = dmmf.isModel(modelName) ? 'Model' : 'Output';
  const module =
    (kind === 'Model' ? modelName : dmmf.getModelNameOfOutputType(modelName)) ||
    'Prisma';

  const sourceFilePath = getSourceFilePath(srcPath, module, modelName, kind);
  if (project.isSourceFileExists(sourceFilePath)) {
    return;
  }
  project.createSourceFile(sourceFilePath);

  const typeFound = dmmf.getNonPrimitiveType(
    'outputObjectTypes',
    namespace,
    modelName,
  );
  if (!typeFound) {
    throw new Error(`Cannot find output type ${modelName}`);
  }
  const type =
    kind === 'Model' ? removeCountAndRelationFields(typeFound) : typeFound;
  const { fields } = type;

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['ObjectType', 'Field'],
    },
  ];
  const properties: PropertyDeclarationStructure[] = [];

  for (const field of fields) {
    const { imports: propertyImports, property } = getSchemaFieldDeclaration(
      sourceFilePath,
      options,
      field,
      fieldDocumentations?.[field.name],
    );
    imports.push(...propertyImports);
    properties.push(property);
  }

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: modelName,
    isExported: true,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'ObjectType',
        arguments: [`{ description: ${JSON.stringify(documentation)} }`],
      },
    ],
    properties,
    docs: documentation ? [documentation] : [],
  };

  project.setSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [
      GENERATED_WARNING_COMMENT,
      ...optimizeImports(imports, modelName),
      classDeclaration,
    ],
  });

  generatePropertyTypes(project, options, type);
}

function removeCountAndRelationFields(outputType: OutputType): OutputType {
  const { fields } = outputType;

  return {
    ...outputType,
    fields: fields.filter(
      ({ name, outputType: { location, namespace } }) =>
        !(
          name === '_count' ||
          (location === 'outputObjectTypes' && namespace === 'model')
        ),
    ),
  };
}
