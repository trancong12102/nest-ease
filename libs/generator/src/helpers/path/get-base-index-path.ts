import { getBaseDirectoryPath } from './get-base-directory-path';
import { join } from 'path';
import { BaseFileKind } from '../../enums/base-file-kind';

export function getBaseIndexPath(srcPath: string, kind?: BaseFileKind) {
  return join(getBaseDirectoryPath(srcPath, kind), 'index.ts');
}
