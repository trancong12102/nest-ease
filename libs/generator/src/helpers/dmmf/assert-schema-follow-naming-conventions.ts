import { PrismaDMMF } from '../../types/dmmf.type';
import { getIfSchemaFollowNamingConventions } from './get-if-schema-follow-naming-conventions';
import { stylize } from '../../utils/logger';

export function assertSchemaFollowNamingConventions(dmmf: PrismaDMMF) {
  const {
    datamodel: { models },
  } = dmmf;

  if (!getIfSchemaFollowNamingConventions(models)) {
    throw new Error(
      `Your schema does not follow the naming convention.
Please check the following documentation for more details: ${stylize(
        'https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#naming-conventions',
        'green'
      )}`
    );
  }
}
