import path from 'path';
import { FileKind, ModuleFileKind } from '../../types/file-kind.type';
import { kebabCase } from 'case-anything';
import { getSourceFileName } from './get-source-file-name';
import { MODULE_FILE_KINDS } from '../../contants/file-kind.const';

export function getSourceFilePath(
  srcPath: string,
  module: string,
  classname: string,
  kind: FileKind
) {
  const isModuleFileKind = MODULE_FILE_KINDS.includes(kind as ModuleFileKind);

  // If file kind is not a module file kind, then it always should be in base dir
  const isInBaseDir =
    !isModuleFileKind || new RegExp(`Base${kind}$`).test(classname);

  return path.join(
    srcPath,
    kebabCase(module),
    isInBaseDir ? 'base' : '',
    isModuleFileKind ? '' : kebabCase(kind),
    getSourceFileName(classname, kind)
  );
}
