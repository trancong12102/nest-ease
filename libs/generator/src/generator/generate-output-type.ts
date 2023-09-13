import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator';
import { FieldNamespace } from '../types/dmmf';
import { getBaseChildFilePath } from '../helpers/path/get-base-child-file-path';
import { BaseFileKind } from '../enums/base-file-kind';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { CodeComment } from '../enums/code-comment';
import { generatePrismaType } from './generate-prisma-type';
import { getPropertyDeclaration } from '../helpers/generator/get-property-declaration';
import { buildModelCommentMap } from '../helpers/comment/build-model-comment-map';

export function generateOutputType(
  project: Project,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  name: string
) {
  const { srcPath, dmmf } = options;
  const model = dmmf.getModel(name);
  const modelCommentMap = buildModelCommentMap(model);
  const kind = dmmf.isModel(name) ? BaseFileKind.Model : BaseFileKind.Output;
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
    kind === BaseFileKind.Model
      ? dmmf.removeRelationFields(type.fields)
      : type.fields;

  for (const field of fields) {
    const { imports: propertyImports, property } = getPropertyDeclaration(
      sourceFilePath,
      options,
      field,
      modelCommentMap.fields?.[field.name]
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
        arguments: [
          `{ description: ${JSON.stringify(modelCommentMap.documentation)} }`,
        ],
      },
    ],
    properties,
    docs: modelCommentMap.documentation ? [modelCommentMap.documentation] : [],
  };

  sourceFile.set({
    kind: StructureKind.SourceFile,
    statements: [
      CodeComment.GenratedFileComment,
      ...optimizeImports(imports, name),
      classDeclaration,
    ],
  });

  for (const field of fields) {
    const { outputType } = field;
    generatePrismaType(project, options, outputType);
  }
}
