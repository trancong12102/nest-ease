import {
  BASE_FILE_KINDS,
  MODULE_FILE_KINDS,
} from '../contants/file-kind.const';

export type BaseFileKind = (typeof BASE_FILE_KINDS)[number];
export type ModuleFileKind = (typeof MODULE_FILE_KINDS)[number];

export type FileKind = BaseFileKind | ModuleFileKind;
