import {
  EnumDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator';
import { FieldNamespace } from '../types/dmmf';
import { getBaseChildFilePath } from '../helpers/path/get-base-child-file-path';
import { BaseFileKind } from '../enums/base-file-kind';
import { CodeComment } from '../enums/code-comment';
import { buildEnumComment } from '../helpers/comment/build-enum-comment';

export function generateEnumType(
  project: Project,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  name: string
) {
  const { dmmf, srcPath } = options;

  const sourceFilePath = getBaseChildFilePath(srcPath, name, BaseFileKind.Enum);
  if (project.getSourceFile(sourceFilePath)) {
    return;
  }
  const sourceFile = project.createSourceFile(sourceFilePath, undefined, {
    overwrite: true,
  });

  const type = dmmf.getNonPrimitiveType('enumTypes', namespace, name);
  if (!type) {
    throw new Error(`Cannot find enum type ${name}`);
  }

  const { values } = type;
  const datamodelEnum = dmmf.getDatamodelType('enums', name);
  const comment = buildEnumComment(datamodelEnum);

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      namedImports: ['registerEnumType'],
      moduleSpecifier: '@nestjs/graphql',
    },
  ];
  const enumStructure: EnumDeclarationStructure = {
    kind: StructureKind.Enum,
    isExported: true,
    name,
    members: values.map((value) => ({
      name: value,
      value,
    })),
    docs: comment ? [comment] : [],
  };
  sourceFile.set({
    kind: StructureKind.SourceFile,
    statements: [
      CodeComment.GeneratedWarning,
      ...imports,
      enumStructure,
      `registerEnumType(${name}, { name: '${name}', description: ${JSON.stringify(
        comment
      )} })`,
    ],
  });
}
