import {
  GetFieldGraphqlDeclarationArgs,
  GraphqlTypeDeclaration,
} from '../../types/generator.type';
import { ImportDeclarationStructure, StructureKind } from 'ts-morph';
import { getImportModuleSpecifier } from '../import/get-import-module-specifier';
import { getGraphqlType } from '../type/get-graphql-type';
import { getScalarGraphqlDeclaration } from './get-scalar-graphql-declaration';
import { getSourceFilePath } from '../path/get-source-file-path';

export function getFieldGraphqlDeclaration(
  args: GetFieldGraphqlDeclarationArgs
): GraphqlTypeDeclaration {
  const {
    type,
    location,
    generatorOptions: { dmmf, srcPath },
    importDest,
    isList,
  } = args;

  if (location === 'fieldRefTypes') {
    throw new Error('Field ref types are not supported');
  }

  if (location === 'scalar') {
    return getScalarGraphqlDeclaration(type, isList);
  }

  const kind = dmmf.getNonPrimitiveTypeFileKind(type, location);
  const module = dmmf.getModelNameOfType(type, kind) || 'Prisma';

  const typeFilepath = getSourceFilePath(srcPath, module, type, kind);

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(importDest, typeFilepath),
      namedImports: [type],
    },
  ];

  return {
    imports,
    type: getGraphqlType(type, isList),
  };
}
