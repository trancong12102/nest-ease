import { pascalCase } from 'case-anything';
import { FileKind } from '../../types/file-kind';

export function getClassname(
  name: string | 'Prisma' | 'NestEase',
  kind: FileKind
) {
  return pascalCase(`${name}-${kind}`);
}
