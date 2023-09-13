import { FileKind } from '../../enums/file-kind';
import { pascalCase } from 'case-anything';

export function getClassname(name: string, kind: FileKind) {
  return pascalCase(`${name}-${kind}`);
}
