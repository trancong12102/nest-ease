import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  PropertyDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { FieldNamespace } from '../types/dmmf.type';
import { selectInputType } from '../helpers/dmmf/select-input-type';
import { optimizeImports } from '../helpers/import/optimize-imports';
import { generatePrismaType } from './generate-prisma-type';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSchemaArgDeclaration } from '../helpers/declaration/get-schema-arg-declaration';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';

export function generateInputObjectType(
  project: Project,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  inputTypeName: string
) {
  const { dmmf, srcPath } = options;

  const module = dmmf.getModelNameOfInputType(inputTypeName) || 'Prisma';

  const sourceFilePath = getSourceFilePath(
    srcPath,
    module,
    inputTypeName,
    'Input'
  );
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

  const type = dmmf.getNonPrimitiveType(
    'inputObjectTypes',
    namespace,
    inputTypeName
  );
  if (!type) {
    throw new Error(`Cannot find enum type ${inputTypeName}`);
  }

  const { fields } = type;
  const isNestedInputType = getIsNestedInputType(inputTypeName);

  for (const field of fields) {
    const { imports: propertyImports, property } = getSchemaArgDeclaration(
      sourceFilePath,
      options,
      field,
      {
        isInNestedInputType: isNestedInputType,
      }
    );
    imports.push(...propertyImports);
    properties.push(property);
  }

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: inputTypeName,
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
      ...optimizeImports(imports, inputTypeName),
      classDeclaration,
    ],
  });

  for (const field of fields) {
    const { inputTypes } = field;
    const inputType = selectInputType(inputTypes);
    generatePrismaType(project, options, inputType);
  }
}

function getIsNestedInputType(inputType: string) {
  return /.*?Nested.*?Input$/.test(inputType);
}
