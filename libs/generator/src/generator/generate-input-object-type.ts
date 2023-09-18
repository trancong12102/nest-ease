import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { FieldNamespace } from '../types/dmmf.type';
import { getBaseChildFilePath } from '../helpers/path/get-base-child-file-path';
import { selectInputType } from '../helpers/dmmf/select-input-type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { generatePrismaType } from './generate-prisma-type';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSchemaArgDeclaration } from '../helpers/declaration/get-schema-arg-declaration';

export function generateInputObjectType(
  project: Project,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  name: string
) {
  const { dmmf, srcPath } = options;

  const sourceFilePath = getBaseChildFilePath(srcPath, name, 'Input');
  if (project.getSourceFile(sourceFilePath)) {
    return;
  }
  const sourceFile = project.createSourceFile(sourceFilePath, undefined, {
    overwrite: true,
  });
  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['InputType', 'Field'],
    },
  ];
  const properties: PropertyDeclarationStructure[] = [];

  const type = dmmf.getNonPrimitiveType('inputObjectTypes', namespace, name);
  if (!type) {
    throw new Error(`Cannot find enum type ${name}`);
  }

  const { fields } = type;
  const isNestedInputType = getIsNestedInputType(name);

  const shouldImportHideField =
    isNestedInputType && fields.some((f) => getIsHiddenField(f.name));
  if (shouldImportHideField) {
    imports.push({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/graphql',
      namedImports: ['HideField'],
    });
  }

  for (const field of fields) {
    const { imports: propertyImports, property } = getSchemaArgDeclaration(
      sourceFilePath,
      options,
      field
    );
    if (isNestedInputType && getIsHiddenField(field.name)) {
      property.decorators = (property.decorators || [])
        .filter((d) => d.name !== 'Field')
        .concat({
          kind: StructureKind.Decorator,
          name: 'HideField',
          arguments: [],
        });
    }
    imports.push(...propertyImports);
    properties.push(property);
  }

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name,
    isExported: true,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'InputType',
        arguments: [],
      },
    ],
    properties,
  };

  sourceFile.set({
    kind: StructureKind.SourceFile,
    statements: [
      GENERATED_WARNING_COMMENT,
      ...optimizeImports(imports, name),
      classDeclaration,
    ],
  });

  for (const field of fields) {
    const { inputTypes } = field;
    const inputType = selectInputType(inputTypes);
    generatePrismaType(project, options, inputType);
  }
}

function getIsHiddenField(name: string) {
  return [
    'connectOrCreate',
    'deleteMany',
    'set',
    'updateMany',
    'upsert',
    'createMany',
  ].includes(name);
}

function getIsNestedInputType(inputType: string) {
  return inputType.match(/.*?Nested.*?Input$/);
}
