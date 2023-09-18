import { camelCase, pascalCase } from 'case-anything';
import { Model } from '../../types/dmmf.type';

export function getIfSchemaFollowNamingConvention(models: Model[]): boolean {
  for (const model of models) {
    const { name: modelName } = model;
    if (modelName !== pascalCase(modelName)) {
      return false;
    }

    const { fields } = model;

    for (const field of fields) {
      const { name: fieldName } = field;
      if (fieldName !== camelCase(fieldName)) {
        return false;
      }
    }
  }

  return true;
}
