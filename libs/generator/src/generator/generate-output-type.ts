import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { FieldNamespace, SchemaField } from '../types/dmmf.type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { generatePrismaType } from './generate-prisma-type';
import { buildModelDocumentations } from '../helpers/documentation/build-model-documentations';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSchemaFieldDeclaration } from '../helpers/declaration/get-schema-field-declaration';
import { TypeFileKind } from '../types/file-kind.type';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';

export function generateOutputType(
  project: Project,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  modelName: string
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
  if (project.getSourceFile(sourceFilePath)) {
    return;
  }

  const sourceFile = project.createSourceFile(sourceFilePath, undefined, {
    overwrite: true,
  });
  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['ObjectType', 'Field'],
    },
  ];
  const properties: PropertyDeclarationStructure[] = [];

  const type = dmmf.getNonPrimitiveType(
    'outputObjectTypes',
    namespace,
    modelName
  );
  if (!type) {
    throw new Error(`Cannot find output type ${modelName}`);
  }

  const fields =
    kind === 'Model' ? removeCountAndRelationFields(type.fields) : type.fields;

  for (const field of fields) {
    const { imports: propertyImports, property } = getSchemaFieldDeclaration(
      sourceFilePath,
      options,
      field,
      fieldDocumentations?.[field.name]
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

  sourceFile.set({
    kind: StructureKind.SourceFile,
    statements: [
      GENERATED_WARNING_COMMENT,
      ...optimizeImports(imports, modelName),
      classDeclaration,
    ],
  });

  for (const field of fields) {
    const { outputType } = field;
    generatePrismaType(project, options, outputType);
  }
}

function removeCountAndRelationFields(fields: SchemaField[]) {
  return fields.filter(
    ({ name, outputType: { location, namespace } }) =>
      !(
        name === '_count' ||
        (location === 'outputObjectTypes' && namespace === 'model')
      )
  );
}
