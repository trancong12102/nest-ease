import { ImportDeclarationStructure, StructureKind } from 'ts-morph';
import { groupBy, uniqBy } from 'ramda';

export function optimizeImports(
  imports: ImportDeclarationStructure[],
  self: string,
): ImportDeclarationStructure[] {
  const importsWithoutSelf = uniqBy((i) => createImportKey(i), imports)
    .map((i) => ({
      ...i,
      namedImports: (i.namedImports as string[])?.filter((ni) => ni !== self),
    }))
    .filter((i) => i.namedImports?.length > 0);

  const groupedImports = groupBy(
    (i) => createImportKey(i, false),
    importsWithoutSelf,
  );

  return Object.values(groupedImports)
    .filter((g) => !!g)
    .map((group) => {
      const first = group?.[0];
      if (!first) {
        throw new Error('Cannot find first import');
      }

      return {
        ...first,
        kind: StructureKind.ImportDeclaration,
        namedImports: Array.from(new Set(group.flatMap((i) => i.namedImports))),
      };
    });
}

function createImportKey(
  importDeclaration: ImportDeclarationStructure,
  withNamedImports = true,
): string {
  const {
    namedImports,
    namespaceImport,
    defaultImport,
    moduleSpecifier,
    isTypeOnly,
  } = importDeclaration;

  if (!Array.isArray(namedImports)) {
    throw new Error('Named imports must be an array');
  }
  for (const namedImport of namedImports) {
    if (typeof namedImport !== 'string') {
      throw new Error('Named import must be a string');
    }
  }

  const namedImportsKey = namedImports.join(',');
  const othersKey = `${moduleSpecifier}_${namespaceImport}_${defaultImport}_${isTypeOnly}`;

  return withNamedImports ? `${namedImportsKey}_${othersKey}` : othersKey;
}
