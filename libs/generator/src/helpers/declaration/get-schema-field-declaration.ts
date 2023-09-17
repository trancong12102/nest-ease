import { StructureKind } from 'ts-morph';
import {
  GeneratorOptions,
  TypePropertyDeclaration,
} from '../../types/generator.type';
import { SchemaField } from '../../types/dmmf.type';
import { getFieldDeclaration } from './get-field-declaration';

export function getSchemaFieldDeclaration(
  sourceFilePath: string,
  generatorOptions: GeneratorOptions,
  field: SchemaField,
  comment?: string
): TypePropertyDeclaration {
  const { outputType, name, isNullable } = field;
  const { isList, location, namespace, type } = outputType;

  const { imports, decorators, propertyType, graphqlType } =
    getFieldDeclaration({
      type,
      location,
      namespace,
      importDest: sourceFilePath,
      generatorOptions,
      propertyOptions: {
        isList,
        isNullable,
      },
    });

  return {
    imports,
    property: {
      kind: StructureKind.Property,
      name: name,
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
