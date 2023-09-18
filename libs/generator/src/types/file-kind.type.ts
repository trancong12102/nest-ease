import {
  FILE_KINDS,
  MODULE_FILE_KINDS,
  TYPE_FILE_KINDS,
} from '../contants/file-kind.const';

export type ModuleFileKind = (typeof MODULE_FILE_KINDS)[number];
export type TypeFileKind = (typeof TYPE_FILE_KINDS)[number];

export type FileKind = (typeof FILE_KINDS)[number];
