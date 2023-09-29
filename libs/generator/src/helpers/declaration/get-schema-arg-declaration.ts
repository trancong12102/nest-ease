import { ImportDeclarationStructure, StructureKind } from 'ts-morph';
import {
  GeneratorOptions,
  PropertyDeclarationWithImports,
} from '../../types/generator.type';
import { SchemaArg } from '../../types/dmmf.type';
import { selectInputType } from '../dmmf/select-input-type';
import { getFieldPropertyDeclaration } from './get-field-property-declaration';
import { getFieldGraphqlDeclaration } from './get-field-graphql-declaration';

export function getSchemaArgDeclaration(
  sourceFilePath: string,
  generatorOptions: GeneratorOptions,
  field: SchemaArg,
  options?: {
    documentation?: string;
    isInNestedInputType?: boolean;
  },
): PropertyDeclarationWithImports {
  const { documentation, isInNestedInputType } = options || {};
  const { inputTypes, isRequired, name: propertyName } = field;
  const isNullable = !isRequired;
  const isHiddenField =
    isInNestedInputType && getIsNestedInputHiddenField(propertyName);
  const inputType = selectInputType(inputTypes);
  const { type, location, namespace, isList } = inputType;
  const hiddenFieldImports: ImportDeclarationStructure[] = isHiddenField
    ? [
        {
          kind: StructureKind.ImportDeclaration,
          moduleSpecifier: '@nestjs/graphql',
          namedImports: ['HideField'],
        },
      ]
    : [];

  const { imports: propertyImports, property } = getFieldPropertyDeclaration({
    name: propertyName,
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

  const { imports: graphqlImports, type: graphqlType } = isHiddenField
    ? {
        imports: [],
        type: '',
      }
    : getFieldGraphqlDeclaration({
        type,
        location,
        isList,
        importDest: sourceFilePath,
        generatorOptions,
      });

  const { decorators } = property;

  return {
    imports: [...graphqlImports, ...propertyImports, ...hiddenFieldImports],
    property: {
      ...property,
      decorators: [
        ...(decorators || []),
        isHiddenField
          ? {
              kind: StructureKind.Decorator,
              name: 'HideField',
              arguments: [],
            }
          : {
              kind: StructureKind.Decorator,
              name: 'Field',
              arguments: [
                `() => ${graphqlType}, { nullable: ${isNullable}, description: ${JSON.stringify(
                  documentation,
                )} }`,
              ],
            },
      ],
      hasQuestionToken: isNullable,
      hasExclamationToken: !isNullable,
      docs: documentation ? [documentation] : [],
    },
  };
}

function getIsNestedInputHiddenField(name: string) {
  return [
    'connectOrCreate',
    'deleteMany',
    'set',
    'updateMany',
    'upsert',
    'createMany',
  ].includes(name);
}
