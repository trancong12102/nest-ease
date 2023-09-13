import { join } from 'path';
import { getBaseDirectoryPath } from './get-base-directory-path';
import { getFilenameFromClass } from './get-filename-from-class';
import { BaseFileKind } from '../../enums/base-file-kind';

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
