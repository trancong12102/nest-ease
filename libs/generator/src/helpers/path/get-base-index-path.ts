import { getBaseDirectoryPath } from './get-base-directory-path';
import { join } from 'path';
import { BaseFileKind } from '../../types/file-kind.type';

export function getBaseIndexPath(srcPath: string, kind?: BaseFileKind) {
  return join(getBaseDirectoryPath(srcPath, kind), 'index.ts');
}
