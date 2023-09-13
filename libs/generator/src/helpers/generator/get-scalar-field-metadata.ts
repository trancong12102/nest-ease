import { StructureKind } from 'ts-morph';
import { FieldMetadata, PropertyTypeOptions } from '../../types/generator';
import { getPropertyType } from './get-property-type';
import { getGraphqlType } from './get-graphql-type';

export function getScalarFieldMetadata(
  name: string,
  propertyOptions: PropertyTypeOptions
): FieldMetadata {
  const { isList } = propertyOptions;

  switch (name) {
    case 'Json':
      return {
        decorators: [],
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLJSON'],
            moduleSpecifier: 'graphql-scalars',
          },
        ],
        propertyType: getPropertyType('any', propertyOptions),
        graphqlType: getGraphqlType('GraphQLJSON', isList),
      };
    case 'Int':
      return {
        decorators: [],
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['Int'],
            moduleSpecifier: '@nestjs/graphql',
          },
        ],
        propertyType: getPropertyType('number', propertyOptions),
        graphqlType: getGraphqlType('Int', isList),
      };
    case 'Boolean':
      return {
        decorators: [],
        imports: [],
        propertyType: getPropertyType('boolean', propertyOptions),
        graphqlType: getGraphqlType('Boolean', isList),
      };
    case 'String':
      return {
        decorators: [],
        imports: [],
        propertyType: getPropertyType('string', propertyOptions),
        graphqlType: getGraphqlType('String', isList),
      };
    case 'DateTime':
      return {
        decorators: [],
        imports: [],
        propertyType: getPropertyType('Date | string', propertyOptions),
        graphqlType: getGraphqlType('Date', isList),
      };
    case 'Float':
      return {
        decorators: [],
        imports: [],
        propertyType: getPropertyType('number', propertyOptions),
        graphqlType: getGraphqlType('Number', isList),
      };
    case 'Bytes':
      return {
        decorators: [],
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLByte'],
            moduleSpecifier: 'graphql-scalars',
          },
        ],
        propertyType: getPropertyType('Buffer', propertyOptions),
        graphqlType: getGraphqlType('GraphQLByte', isList),
      };
    case 'BigInt':
      return {
        decorators: [],
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLBigInt'],
            moduleSpecifier: 'graphql-scalars',
          },
        ],
        propertyType: getPropertyType('bigint', propertyOptions),
        graphqlType: getGraphqlType('GraphQLBigInt', isList),
      };
    case 'Decimal':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLDecimal', 'transformToDecimal'],
            moduleSpecifier: 'prisma-graphql-type-decimal',
          },
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['Transform', 'Type'],
            moduleSpecifier: 'class-transformer',
          },
        ],
        decorators: [
          {
            kind: StructureKind.Decorator,
            name: 'Type',
            arguments: ['() => Object'],
          },
          {
            kind: StructureKind.Decorator,
            name: 'Transform',
            arguments: ['transformToDecimal'],
          },
        ],
        propertyType: getPropertyType('number', propertyOptions),
        graphqlType: getGraphqlType('GraphQLDecimal', isList),
      };
    default:
      throw new Error(`Unknown scalar type: ${name}`);
  }
}
