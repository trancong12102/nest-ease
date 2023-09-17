import { kebabCase } from 'case-anything';
import { FileKind } from '../../types/file-kind.type';

export function getFilenameFromClass(className: string, kind: FileKind) {
  const fileKind = kebabCase(kind);
  const basename = kebabCase(className).replace(
    new RegExp(`-${fileKind}$`),
    ''
  );
  const fileType = fileKind.replace('-', '.');

  return `${basename}.${fileType}.ts`.replace('.base', '-base');
}
