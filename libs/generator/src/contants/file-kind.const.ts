export const BASE_FILE_KINDS = [
  'Input',
  'Output',
  'Model',
  'Enum',
  'Args',
  'BaseService',
  'BaseResolver',
] as const;

export const MODULE_FILE_KINDS = ['Service', 'Resolver', 'Module'] as const;

export const FILE_KINDS = [...BASE_FILE_KINDS, ...MODULE_FILE_KINDS] as const;
