import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Scope,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { ModelMapping } from '../types/dmmf.type';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { isPathExists } from '../utils/is-path-exists';
import { getModuleFileClassName } from '../helpers/path/get-module-file-class-name';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';

export async function generateModelService(
  project: ProjectStructure,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const { srcPath, overwriteCustomFiles, prismaServicePath } = generatorOptions;
  const {
    model: { name: modelName },
  } = modelMapping;

  const className = getModuleFileClassName(modelName, 'Service');
  const sourceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    className,
    'Service'
  );
  if (!overwriteCustomFiles && (await isPathExists(sourceFilePath))) {
    return;
  }

  const baseServiceClassName = getModuleFileClassName(
    modelName,
    'Service',
    true
  );
  const baseServiceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    baseServiceClassName,
    'Service'
  );
  const prismaServiceClassName = getModuleFileClassName('Prisma', 'Service');

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/common',
      namedImports: ['Injectable'],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        baseServiceFilePath
      ),
      namedImports: [baseServiceClassName],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        prismaServicePath
      ),
      namedImports: [prismaServiceClassName],
    },
  ];

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: className,
    isExported: true,
    extends: baseServiceClassName,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'Injectable',
        arguments: [],
      },
    ],
    ctors: [
      {
        parameters: [
          {
            name: 'prisma',
            type: prismaServiceClassName,
            isReadonly: true,
            scope: Scope.Protected,
          },
        ],
        statements: ['super(prisma);'],
      },
    ],
  };

  project.createSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [...imports, classDeclaration],
  });
}
