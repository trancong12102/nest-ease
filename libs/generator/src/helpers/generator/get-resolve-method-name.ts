import { camelCase } from 'case-anything';

export function getResolveMethodName(fieldName: string) {
  return camelCase(`resolve_${fieldName}`);
}
