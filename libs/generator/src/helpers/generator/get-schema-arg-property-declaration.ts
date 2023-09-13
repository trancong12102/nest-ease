import { StructureKind } from 'ts-morph';
import {
  GeneratorOptions,
  TypePropertyDeclaration,
} from '../../types/generator';
import { SchemaArg } from '../../types/dmmf';
import { getFieldMetadata } from './get-field-metadata';
import { selectInputType } from '../dmmf/select-input-type';

export function getSchemaArgPropertyDeclaration(
  sourceFilePath: string,
  generatorOptions: GeneratorOptions,
  field: SchemaArg,
  comment?: string
): TypePropertyDeclaration {
  const { inputTypes, isRequired, name } = field;
  const isNullable = !isRequired;
  const inputType = selectInputType(inputTypes);
  const { type, location, namespace, isList } = inputType;

  const { imports, decorators, propertyType, graphqlType } = getFieldMetadata({
    type,
    generatorOptions,
    location,
    namespace,
    importDest: sourceFilePath,
    propertyOptions: {
      isList,
    },
  });

  return {
    imports,
    property: {
      kind: StructureKind.Property,
      name,
      type: propertyType,
      decorators: [
        ...decorators,
        {
          kind: StructureKind.Decorator,
          name: 'Field',
          arguments: [
            `() => ${graphqlType}, { nullable: ${isNullable}, description: ${JSON.stringify(
              comment
            )} }`,
          ],
        },
      ],
      hasQuestionToken: isNullable,
      hasExclamationToken: !isNullable,
      docs: comment ? [comment] : [],
    },
  };
}
