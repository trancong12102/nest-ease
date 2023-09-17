import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { FieldNamespace, SchemaField } from '../types/dmmf.type';
import { getBaseChildFilePath } from '../helpers/path/get-base-child-file-path';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { generatePrismaType } from './generate-prisma-type';
import { getPropertyDeclaration } from '../helpers/generator/get-property-declaration';
import { buildModelDocumentations } from '../helpers/documentation/build-model-documentations';
import { BaseFileKind } from '../types/file-kind.type';
import { GENERATED_FILE_COMMENT } from '../contants/comment.const';

export function generateOutputType(
  project: Project,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  name: string
) {
  const { srcPath, dmmf } = options;
  const model = dmmf.getModel(name);
  const { documentation, fields: fieldDocumentations } =
    buildModelDocumentations(model);
  const kind: BaseFileKind = dmmf.isModel(name) ? 'model' : 'output';
  const sourceFilePath = getBaseChildFilePath(srcPath, name, kind);
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

  const type = dmmf.getNonPrimitiveType('outputObjectTypes', namespace, name);
  if (!type) {
    throw new Error(`Cannot find output type ${name}`);
  }

  const fields =
    kind === 'model' ? removeCountAndRelationFields(type.fields) : type.fields;

  for (const field of fields) {
    const { imports: propertyImports, property } = getPropertyDeclaration(
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
    name,
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
      GENERATED_FILE_COMMENT,
      ...optimizeImports(imports, name),
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
