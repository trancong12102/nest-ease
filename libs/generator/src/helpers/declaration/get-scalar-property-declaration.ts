import {
  PropertyTypeOptions,
  PropertyDeclarationWithImports,
} from '../../types/generator.type';
import { StructureKind } from 'ts-morph';
import { getPropertyType } from '../type/get-property-type';

export function getScalarPropertyDeclaration(
  name: string,
  type: string,
  options: PropertyTypeOptions
): PropertyDeclarationWithImports {
  switch (type) {
    case 'Json':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['JsonValue'],
            moduleSpecifier: 'type-fest',
            isTypeOnly: true,
          },
        ],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('JsonValue', options),
        },
      };
    case 'Int':
      return {
        imports: [],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('number', options),
        },
      };
    case 'Boolean':
      return {
        imports: [],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('boolean', options),
        },
      };
    case 'String':
      return {
        imports: [],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('string', options),
        },
      };
    case 'DateTime':
      return {
        imports: [],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('Date | string', options),
        },
      };
    case 'Float':
      return {
        imports: [],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('number', options),
        },
      };
    case 'Bytes':
      return {
        imports: [],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('Buffer', options),
        },
      };
    case 'BigInt':
      return {
        imports: [],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('bigint | number', options),
        },
      };
    case 'Decimal':
      return {
        imports: [
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['transformToDecimal'],
            moduleSpecifier: 'prisma-graphql-type-decimal',
          },
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['Transform', 'Type'],
            moduleSpecifier: 'class-transformer',
          },
          {
            kind: StructureKind.ImportDeclaration,
            namedImports: ['Decimal'],
            moduleSpecifier: '@prisma/client/runtime/library',
          },
        ],
        property: {
          kind: StructureKind.Property,
          name,
          type: getPropertyType('Decimal', options),
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
        },
      };
    default:
      throw new Error(`Unknown scalar type: ${name}`);
  }
}
