export function getCompoundFieldName(args: {
  name?: string | null;
  fields: string[];
}) {
  const { name, fields } = args;

  return name || fields.join('_');
}
