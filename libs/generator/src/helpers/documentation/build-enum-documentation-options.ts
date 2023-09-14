import { DatamodelEnum, EnumValue } from '../../types/dmmf';
import { EnumOptions } from '@nestjs/graphql';

export function buildEnumDocumentationOptions(
  datamodelEnum?: DatamodelEnum
): Pick<EnumOptions, 'description' | 'valuesMap'> {
  if (!datamodelEnum) {
    return {};
  }

  const values = datamodelEnum.values as Array<
    EnumValue & {
      documentation?: string;
    }
  >;

  return {
    description: datamodelEnum.documentation,
    valuesMap: values.reduce<EnumOptions['valuesMap']>(
      (acc, { name, documentation }) => ({
        ...acc,
        [name]: {
          description: documentation,
        },
      }),
      {}
    ),
  };
}
