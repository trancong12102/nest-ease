import { ModuleFileKind } from '../../types/file-kind.type';
import { pascalCase } from 'case-anything';

export function getModuleFileClassName(
  module: string,
  kind: ModuleFileKind,
  base?: boolean
) {
  const baseSuffix = base ? 'Base' : '';

  return pascalCase(`${module}${baseSuffix}-${kind}`);
}
