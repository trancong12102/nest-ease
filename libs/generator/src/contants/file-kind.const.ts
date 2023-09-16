export const BASE_FILE_KINDS = [
  'input',
  'output',
  'model',
  'enum',
  'args',
  'base-service',
  'base-resolver',
] as const;

export const MODULE_FILE_KINDS = ['service', 'resolver', 'module'] as const;

export const FILE_KINDS = [...BASE_FILE_KINDS, ...MODULE_FILE_KINDS] as const;
