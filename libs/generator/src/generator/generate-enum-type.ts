import {
  EnumDeclarationStructure,
  ImportDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { FieldNamespace } from '../types/dmmf.type';
import { buildEnumDocumentationOptions } from '../helpers/documentation/build-enum-documentation-options';
import { GENERATED_WARNING_COMMENT } from '../contants/comment.const';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export function generateEnumType(
  project: ProjectStructure,
  options: GeneratorOptions,
  namespace: FieldNamespace,
  enumName: string,
) {
  const { dmmf, srcPath } = options;
  const module = dmmf.getModelNameOfEnumType(enumName) || 'Prisma';

  const sourceFilePath = getSourceFilePath(srcPath, module, enumName, 'Enum');
  if (project.isSourceFileExists(sourceFilePath)) {
    return;
  }
  project.createSourceFile(sourceFilePath);

  const type = dmmf.getNonPrimitiveType('enumTypes', namespace, enumName);
  if (!type) {
    throw new Error(`Cannot find enum type ${enumName}`);
  }

  const { values } = type;
  const datamodelEnum = dmmf.getDatamodelType('enums', enumName);
  const { description, valuesMap } =
    buildEnumDocumentationOptions(datamodelEnum);

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      namedImports: ['registerEnumType'],
      moduleSpecifier: '@nestjs/graphql',
    },
  ];

  const enumStructure: EnumDeclarationStructure = {
    kind: StructureKind.Enum,
    isExported: true,
    name: enumName,
    members: values.map((value) => {
      const comment = valuesMap?.[value]?.description;

      return {
        name: value,
        value,
        docs: comment ? [comment] : [],
      };
    }),
    docs: description ? [description] : [],
  };
  project.setSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [
      GENERATED_WARNING_COMMENT,
      ...imports,
      enumStructure,
      `registerEnumType(${enumName}, { name: '${enumName}', description: ${JSON.stringify(
        description,
      )}, valuesMap: ${JSON.stringify(valuesMap)} })`,
    ],
  });
}
