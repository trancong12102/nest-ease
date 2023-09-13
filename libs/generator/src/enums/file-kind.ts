import { BaseFileKind } from './base-file-kind';
import { ModuleFileKind } from './module-file-kind';

export const FileKind = {
  ...BaseFileKind,
  ...ModuleFileKind,
};
export type FileKind = BaseFileKind | ModuleFileKind;
