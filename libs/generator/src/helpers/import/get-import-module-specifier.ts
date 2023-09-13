import { dirname, relative } from 'path';
import { FileKind } from '../../enums/file-kind';

export function getImportModuleSpecifier(
  importDest: string,
  targetPath: string
) {
  const targetPathWithoutExtension = targetPath.replace(/\.ts$/, '');

  const relativePath = relative(dirname(importDest), targetPathWithoutExtension)
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '.')
    .replace(new RegExp(`(${Object.values(FileKind).join('|')})/.*`), '$1');

  return relativePath.startsWith('../') ? relativePath : `./${relativePath}`;
}
