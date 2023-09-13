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
import { selectInputType } from '../helpers/dmmf/select-input-type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { generatePrismaType } from './generate-prisma-type';
import { CodeComment } from '../enums/code-comment';
import { getPropertyDeclaration } from '../helpers/generator/get-property-declaration';

export function generateInputObjectType(
  project: Project,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  name: string
) {
  const { dmmf, srcPath } = options;

  const sourceFilePath = getBaseChildFilePath(
    srcPath,
    name,
    BaseFileKind.Input
  );
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
      namedImports: ['InputType', 'Field'],
    },
  ];
  const properties: PropertyDeclarationStructure[] = [];

  const type = dmmf.getNonPrimitiveType('inputObjectTypes', namespace, name);
  if (!type) {
    throw new Error(`Cannot find enum type ${name}`);
  }

  const { fields } = type;

  for (const field of fields) {
    const { imports: propertyImports, property } = getPropertyDeclaration(
      sourceFilePath,
      options,
      field
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
        name: 'InputType',
        arguments: [],
      },
    ],
    properties,
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
    const { inputTypes } = field;
    const inputType = selectInputType(inputTypes);
    generatePrismaType(project, options, inputType);
  }
}
