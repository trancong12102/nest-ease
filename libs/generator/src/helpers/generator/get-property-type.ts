import { PropertyTypeOptions } from '../../types/generator';

export function getPropertyType(
  type: string,
  options: PropertyTypeOptions
): string {
  const { isList, isNullable, isPromise, fixCircular } = options;
  let result = type;

  if (isList) {
    result = result
      .split('|')
      .map((t) => t.trim())
      .map((t) => `Array<${t}>`)
      .join(' | ');
  }

  if (fixCircular) {
    result = `Omit<${result}, never>`;
  }

  if (isNullable) {
    result = `${result} | null`;
  }

  if (isPromise) {
    result = `Promise<${result}>`;
  }

  return result;
}
