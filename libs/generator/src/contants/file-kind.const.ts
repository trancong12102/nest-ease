export const TYPE_FILE_KINDS = [
  'Input',
  'Output',
  'Model',
  'Enum',
  'Args',
] as const;

export const MODULE_FILE_KINDS = ['Service', 'Resolver', 'Module'] as const;

export const FILE_KINDS = [...TYPE_FILE_KINDS, ...MODULE_FILE_KINDS];
