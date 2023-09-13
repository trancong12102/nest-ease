import { FileKind } from '../../enums/file-kind';
import { kebabCase } from 'case-anything';

export function getFilenameFromClass(className: string, kind: FileKind) {
  const basename = kebabCase(className).replace(new RegExp(`-${kind}$`), '');
  const fileType = kind.replace('-', '.');

  return `${basename}.${fileType}.ts`.replace('.base', '-base');
}
