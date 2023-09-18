import { dirname, relative } from 'path';

export function getImportModuleSpecifier(
  importDest: string,
  targetPath: string
) {
  const targetPathWithoutExtension = targetPath.replace(/\.ts$/, '');

  const relativePath = relative(dirname(importDest), targetPathWithoutExtension)
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '.');

  return relativePath.startsWith('../') ? relativePath : `./${relativePath}`;
}
