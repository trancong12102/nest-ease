import { join } from 'path';
import { getFilenameFromClass } from './get-filename-from-class';
import { ModuleFileKind } from '../../enums/module-file-kind';
import { kebabCase } from 'case-anything';

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
