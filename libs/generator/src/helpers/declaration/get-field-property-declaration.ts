import { Model } from '../../types/dmmf.type';
import {
  GetFieldPropertyDeclarationArgs,
  PropertyDeclarationWithImports,
} from '../../types/generator.type';
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
import { getSourceFilePath } from '../path/get-source-file-path';

export function getFieldPropertyDeclaration(
  args: GetFieldPropertyDeclarationArgs,
): PropertyDeclarationWithImports {
  const {
    name,
    type,
    location,
    namespace,
    propertyOptions,
    generatorOptions: { dmmf, srcPath, prismaClientPath },
    importDest,
  } = args;

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
  const module = dmmf.getModelNameOfType(type, kind) || 'Prisma';
  const typeFilepath = getSourceFilePath(srcPath, module, type, kind);

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

  const propertyType = kind === 'Enum' ? `keyof typeof ${type}` : type;

  return {
    imports,
    property: {
      kind: StructureKind.Property,
      decorators,
      name,
      type: isWhereUniqueInput
        ? getAtLeastPropertyType(dmmf, type)
        : getPropertyType(propertyType, propertyOptions),
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
