import { StructureKind } from 'ts-morph';
import { GraphqlTypeDeclaration } from '../../types/generator.type';
import { getGraphqlType } from '../type/get-graphql-type';

export function getScalarGraphqlDeclaration(
  name: string,
  isList?: boolean
): GraphqlTypeDeclaration {
  switch (name) {
    case 'Json':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLJSON'],
            moduleSpecifier: 'graphql-scalars',
          },
        ],
        type: getGraphqlType('GraphQLJSON', isList),
      };
    case 'Int':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['Int'],
            moduleSpecifier: '@nestjs/graphql',
          },
        ],
        type: getGraphqlType('Int', isList),
      };
    case 'Boolean':
      return {
        imports: [],
        type: getGraphqlType('Boolean', isList),
      };
    case 'String':
      return {
        imports: [],
        type: getGraphqlType('String', isList),
      };
    case 'DateTime':
      return {
        imports: [],
        type: getGraphqlType('Date', isList),
      };
    case 'Float':
      return {
        imports: [],
        type: getGraphqlType('Number', isList),
      };
    case 'Bytes':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLByte'],
            moduleSpecifier: 'graphql-scalars',
          },
        ],
        type: getGraphqlType('GraphQLByte', isList),
      };
    case 'BigInt':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLBigInt'],
            moduleSpecifier: 'graphql-scalars',
          },
        ],
        type: getGraphqlType('GraphQLBigInt', isList),
      };
    case 'Decimal':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['GraphQLDecimal'],
            moduleSpecifier: 'prisma-graphql-type-decimal',
          },
        ],
        type: getGraphqlType('GraphQLDecimal', isList),
      };
    default:
      throw new Error(`Unknown scalar type: ${name}`);
  }
}
