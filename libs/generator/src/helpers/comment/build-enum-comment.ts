import { DatamodelEnum, EnumValue } from '../../types/dmmf';

export function buildEnumComment(
  datamodelEnum?: DatamodelEnum
): string | undefined {
  if (!datamodelEnum) {
    return undefined;
  }

  const enumDocumentation = datamodelEnum.documentation || '';
  const { values } = datamodelEnum;
  const valuesDocumentation = (
    values as Array<
      EnumValue & {
        documentation?: string;
      }
    >
  )
    .map(({ name, documentation }) => `  - ${name} // ${documentation}`)
    .join('\n');

  if (enumDocumentation === '' && valuesDocumentation === '') {
    return undefined;
  }

  return `${enumDocumentation}\n\nPossible values:\n${valuesDocumentation}`;
}
