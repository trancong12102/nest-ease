import {
  FieldLocation,
  FieldNamespace,
  InputType,
  Model,
  OutputType,
  SchemaEnum,
} from '../../types/dmmf';
import { getScalarFieldMetadata } from './get-scalar-field-metadata';
import {
  FieldMetadata,
  GeneratorOptions,
  PropertyTypeOptions,
} from '../../types/generator';
import {
  DecoratorStructure,
  ImportDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { getBaseChildFilePath } from '../path/get-base-child-file-path';
import { getImportModuleSpecifier } from '../import/get-import-module-specifier';
import { getPropertyType } from './get-property-type';
import { getGraphqlType } from './get-graphql-type';
import { InternalDmmf } from '../dmmf/internal-dmmf';
import { BaseFileKind } from '../../enums/base-file-kind';
import { getCompoundFieldName } from './get-compound-field-name';

export function getFieldMetadata({
  type,
  location,
  namespace,
  propertyOptions,
  generatorOptions: {
    dmmf,
    srcPath,
    config: { prisma },
  },
  importDest,
}: {
  type: string | OutputType | SchemaEnum | InputType;
  location: FieldLocation;
  namespace?: FieldNamespace;
  importDest: string;
  generatorOptions: GeneratorOptions;
  isNullable?: boolean;
  fixCircular?: boolean;
  propertyOptions: PropertyTypeOptions;
}): FieldMetadata {
  const { isList, fixCircular } = propertyOptions;

  if (typeof type !== 'string') {
    throw new Error('Type must be a string');
  }

  if (location === 'fieldRefTypes') {
    throw new Error('Field ref types are not supported');
  }

  if (location === 'scalar') {
    return getScalarFieldMetadata(type, propertyOptions);
  }

  if (!namespace) {
    throw new Error('Namespace is required');
  }

  const kind = dmmf.getNonPrimitiveTypeFileKind(type, location);
  const typeFilepath = getBaseChildFilePath(srcPath, type, kind);
  const isModel = dmmf.isModel(type);

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(importDest, typeFilepath),
      namedImports: [type],
    },
  ];
  const decorators: DecoratorStructure[] = [];

  if (kind === BaseFileKind.Input) {
    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: 'class-transformer',
      namedImports: ['Type'],
    });
    decorators.push({
      kind: StructureKind.Decorator,
      name: 'Type',
      arguments: [`() => ${type}`],
    });
  }

  const isWhereUniqueInput = getIsWhereUniqueInput(type);
  if (isWhereUniqueInput) {
    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(importDest, prisma.clientPath),
      namedImports: ['Prisma'],
    });
  }

  const handleCircular =
    fixCircular ??
    ((isModel ||
      !!(
        type.match(/^.*?UpdateOneRequiredWithout.*?NestedInput$/) ||
        type.match(/^.*?ListRelationFilter$/) ||
        type.match(/^.*?WhereInput$/) ||
        type.match(/^.*?OrderByWithRelationInput$/) ||
        type.match(/^.*?CreateNestedManyWithout.*?Input$/) ||
        type.match(/^.*?CreateNestedOneWithout.*?Input$/) ||
        type.match(/^.*?UpdateOneWithout.*?NestedInput$/) ||
        type.match(/^.*?UpdateManyWithout.*?NestedInput$/)
      )) &&
      !isList);

  const propertyType =
    kind === BaseFileKind.Enum ? `keyof typeof ${type}` : type;

  return {
    imports,
    decorators,
    propertyType: isWhereUniqueInput
      ? getAtLeastPropertyType(dmmf, type)
      : getPropertyType(propertyType, {
          ...propertyOptions,
          fixCircular: handleCircular,
        }),
    graphqlType: getGraphqlType(type, isList),
  };
}

function getAtLeastPropertyType(dmmf: InternalDmmf, type: string): string {
  const modelName = getModelNameFromWhereUniqueInput(type);
  const model = dmmf.getModel(modelName);
  if (!model) {
    throw new Error(`Unknown type: ${type}`);
  }
  const atLeastKeys = getWhereUniqueAtLeastKeys(model);

  return `Prisma.AtLeast<${type}, ${atLeastKeys}>`;
}

function getWhereUniqueAtLeastKeys(model: Model) {
  const names = model.fields
    .filter((field) => field.isUnique || field.isId)
    .map((field) => field.name);

  if (model.primaryKey) {
    names.push(getCompoundFieldName(model.primaryKey));
  }

  for (const uniqueIndex of model.uniqueIndexes) {
    names.push(getCompoundFieldName(uniqueIndex));
  }

  return names.map((name) => `'${name}'`).join(' | ');
}

function getModelNameFromWhereUniqueInput(input: string) {
  return input.replace(/WhereUniqueInput$/, '');
}

function getIsWhereUniqueInput(input: string) {
  return input.endsWith('WhereUniqueInput');
}
