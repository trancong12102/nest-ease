import { PropertyTypeOptions } from '../../types/generator.type';

export function getPropertyType(
  type: string,
  options: PropertyTypeOptions,
): string {
  const { isList, isNullable, isPromise } = options;
  let result = type;

  if (isList) {
    result = result
      .split('|')
      .map((t) => t.trim())
      .map((t) => `Array<${t}>`)
      .join(' | ');
  }

  if (isNullable) {
    result = `${result} | null`;
  }

  if (isPromise) {
    result = `Promise<${result}>`;
  }

  return result;
}
