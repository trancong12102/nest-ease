import { join } from 'path';
import { getBaseDirectoryPath } from './get-base-directory-path';
import { getFilenameFromClass } from './get-filename-from-class';
import { BaseFileKind } from '../../types/file-kind.type';

export function getBaseChildFilePath(
  srcPath: string,
  className: string,
  kind: BaseFileKind
) {
  return join(
    getBaseDirectoryPath(srcPath, kind),
    getFilenameFromClass(className, kind)
  );
}
