import { StructureKind } from 'ts-morph';
import {
  GeneratorOptions,
  PropertyTypeDeclaration,
} from '../../types/generator.type';
import { SchemaField } from '../../types/dmmf.type';
import { getFieldPropertyDeclaration } from './get-field-property-declaration';
import { getFieldGraphqlDeclaration } from './get-field-graphql-declaration';

export function getSchemaFieldDeclaration(
  sourceFilePath: string,
  generatorOptions: GeneratorOptions,
  field: SchemaField,
  comment?: string
): PropertyTypeDeclaration {
  const { name, outputType, isNullable } = field;
  const { isList, location, namespace, type } = outputType;

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
