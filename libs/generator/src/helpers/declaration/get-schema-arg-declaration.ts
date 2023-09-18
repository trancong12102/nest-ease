import { StructureKind } from 'ts-morph';
import {
  GeneratorOptions,
  PropertyTypeDeclaration,
} from '../../types/generator.type';
import { SchemaArg } from '../../types/dmmf.type';
import { selectInputType } from '../dmmf/select-input-type';
import { getFieldPropertyDeclaration } from './get-field-property-declaration';
import { getFieldGraphqlDeclaration } from './get-field-graphql-declaration';

export function getSchemaArgDeclaration(
  sourceFilePath: string,
  generatorOptions: GeneratorOptions,
  field: SchemaArg,
  comment?: string
): PropertyTypeDeclaration {
  const { inputTypes, isRequired, name } = field;
  const isNullable = !isRequired;
  const inputType = selectInputType(inputTypes);
  const { type, location, namespace, isList } = inputType;

  const { imports: propertyImports, property } = getFieldPropertyDeclaration({
    name,
    type,
    location,
    namespace,
    importDest: sourceFilePath,
    propertyOptions: {
      isList,
      isNullable,
    },
    generatorOptions,
  });

  const { imports: graphqlImports, type: graphqlType } =
    getFieldGraphqlDeclaration({
      type,
      location,
      isList,
      importDest: sourceFilePath,
      generatorOptions,
    });

  const { decorators } = property;

  return {
    imports: [...graphqlImports, ...propertyImports],
    property: {
      ...property,
      decorators: [
        ...(decorators || []),
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
