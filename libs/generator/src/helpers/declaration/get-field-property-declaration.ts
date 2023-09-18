import { Model } from '../../types/dmmf.type';
import {
  GetFieldPropertyDeclarationArgs,
  PropertyTypeDeclaration,
} from '../../types/generator.type';
import { getBaseChildFilePath } from '../path/get-base-child-file-path';
import {
  DecoratorStructure,
  ImportDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { getImportModuleSpecifier } from '../import/get-import-module-specifier';
import { getPropertyType } from '../type/get-property-type';
import { InternalDmmf } from '../dmmf/internal-dmmf';
import { getCompoundFieldName } from '../generator/get-compound-field-name';
import { getScalarPropertyDeclaration } from './get-scalar-property-declaration';

export function getFieldPropertyDeclaration(
  args: GetFieldPropertyDeclarationArgs
): PropertyTypeDeclaration {
  const {
    name,
    type,
    location,
    namespace,
    propertyOptions,
    generatorOptions: { dmmf, srcPath, prismaClientPath },
    importDest,
  } = args;

  const { isList, fixCircular } = propertyOptions;

  if (location === 'fieldRefTypes') {
    throw new Error('Field ref types are not supported');
  }

  if (location === 'scalar') {
    return getScalarPropertyDeclaration(name, type, propertyOptions);
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

  if (kind === 'Input') {
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
      moduleSpecifier: getImportModuleSpecifier(importDest, prismaClientPath),
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

  const propertyType = kind === 'Enum' ? `keyof typeof ${type}` : type;

  return {
    imports,
    property: {
      kind: StructureKind.Property,
      decorators,
      name,
      type: isWhereUniqueInput
        ? getAtLeastPropertyType(dmmf, type)
        : getPropertyType(propertyType, {
            ...propertyOptions,
            fixCircular: handleCircular,
          }),
    },
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
