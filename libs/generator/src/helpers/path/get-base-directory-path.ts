import { join } from 'path';
import { BaseFileKind } from '../../types/file-kind';

export function getBaseDirectoryPath(srcPath: string, kind?: BaseFileKind) {
  const baseDirectoryPath = join(srcPath, 'nest-ease/base');
  if (!kind) {
    return baseDirectoryPath;
  }

  return join(baseDirectoryPath, kind.replace('base-', ''));
}
