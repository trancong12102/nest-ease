import { join } from 'path';
import { getFilenameFromClass } from './get-filename-from-class';
import { kebabCase } from 'case-anything';
import { ModuleFileKind } from '../../types/file-kind.type';

export function getModuleChildFilePath(
  srcPath: string,
  module: string,
  childClass: string,
  kind: ModuleFileKind
) {
  return join(
    srcPath,
    kebabCase(module),
    getFilenameFromClass(childClass, kind)
  );
}
