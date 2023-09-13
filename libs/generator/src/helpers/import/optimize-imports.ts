import { ImportDeclarationStructure, StructureKind } from 'ts-morph';

export const optimizeImports = (
  imports: ImportDeclarationStructure[],
  self: string
): ImportDeclarationStructure[] => {
  const importMap: Record<string, string[]> = {};

  for (const importStructure of imports) {
    const { moduleSpecifier } = importStructure;
    if (!Array.isArray(importStructure.namedImports)) {
      throw new Error('Named imports must be an string array');
    }

    const namedImports = importStructure.namedImports as string[];

    importMap[moduleSpecifier] = (importMap[moduleSpecifier] || []).concat(
      namedImports
    );
  }

  return Object.entries(importMap)
    .map(([moduleSpecifier, namedImports]) => ({
      moduleSpecifier,
      namedImports: new Set(namedImports.filter((ni) => ni !== self)),
    }))
    .filter((i) => i.namedImports.size > 0)
    .map(({ namedImports, moduleSpecifier }) => ({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier,
      namedImports: Array.from(namedImports),
    }));
};
