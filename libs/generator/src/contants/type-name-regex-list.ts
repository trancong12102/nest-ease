export const INPUT_NAME_REGEX_LIST = [
  /^(?<model>.+?)Create.*?Input$/,
  /^(?<model>.+?)Create.*?InputEnvelope$/,
  /^(?<model>.+?)(List|Nullable)?RelationFilter$/,
  /^(?<model>.+?)OrderBy.*?Input$/,
  /^(?<model>.+?)ScalarWhereInput$/,
  /^(?<model>.+?)Update.*?Input$/,
  /^(?<model>.+?)Upsert.*?Input$/,
  /^(?<model>.+?)Where.*?Input$/,
] as const;

export const ENUM_INPUT_NAME_REGEX_LIST = [/^Enum(?<enum>.+?)Filter$/] as const;

export const ENUM_NAME_REGEX_LIST = [/^(?<model>.+?)ScalarFieldEnum$/] as const;
