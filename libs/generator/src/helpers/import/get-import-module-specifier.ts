import { dirname, relative } from 'path';
import { FILE_KINDS } from '../../contants/file-kind.const';
import { kebabCase } from 'case-anything';

export function getImportModuleSpecifier(
  importDest: string,
  targetPath: string
) {
  const targetPathWithoutExtension = targetPath.replace(/\.ts$/, '');

  const relativePath = relative(dirname(importDest), targetPathWithoutExtension)
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '.')
    .replace(
      new RegExp(
        `(${Object.values(FILE_KINDS)
          .map((k) => kebabCase(k))
          .join('|')})/.*`
      ),
      '$1'
    );

  return relativePath.startsWith('../') ? relativePath : `./${relativePath}`;
}
