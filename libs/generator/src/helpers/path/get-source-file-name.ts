import { kebabCase } from 'case-anything';
import { FileKind } from '../../types/file-kind.type';

export function getSourceFileName(classname: string, kind: FileKind) {
  return `${kebabCase(
    classname.replace(new RegExp(`${kind}$`), '')
  )}.${kind.toLowerCase()}.ts`;
}
