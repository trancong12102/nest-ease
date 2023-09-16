import { kebabCase } from 'case-anything';
import { FileKind } from '../../types/file-kind';

export function getFilenameFromClass(className: string, kind: FileKind) {
  const basename = kebabCase(className).replace(new RegExp(`-${kind}$`), '');
  const fileType = kind.replace('-', '.');

  return `${basename}.${fileType}.ts`.replace('.base', '-base');
}
