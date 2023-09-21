import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator.type';
import { ModelMapping } from '../types/dmmf.type';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { isPathExists } from '../utils/is-path-exists';
import { assertGitStatusClean } from '../helpers/git/assert-git-status-clean';
import { getModuleFileClassName } from '../helpers/path/get-module-file-class-name';
import { getSourceFilePath } from '../helpers/path/get-source-file-path';
import { ProjectStructure } from '../helpers/project-structure/project-structure';
import { logger, stylize } from '../utils/logger';

export async function generateModelModule(
  project: ProjectStructure,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const { srcPath, overwriteCustomFiles, gitChangedFiles } = generatorOptions;
  const {
    model: { name: modelName },
  } = modelMapping;

  const className = getModuleFileClassName(modelName, 'Module');
  logger.info(stylize(`Generating module ${className}...`, 'dim'));
  const sourceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    className,
    'Module'
  );
  if (!overwriteCustomFiles && (await isPathExists(sourceFilePath))) {
    return;
  }
  assertGitStatusClean(gitChangedFiles, sourceFilePath);

  const serviceClassName = getModuleFileClassName(modelName, 'Service');
  const serviceFilePath = getSourceFilePath(
    srcPath,
    modelName,
    serviceClassName,
    'Service'
  );
  const resolverClassName = getModuleFileClassName(modelName, 'Resolver');
  const resolverFilePath = getSourceFilePath(
    srcPath,
    modelName,
    resolverClassName,
    'Resolver'
  );

  const imports: ImportDeclarationStructure[] = [
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@nestjs/common',
      namedImports: ['Module'],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        serviceFilePath
      ),
      namedImports: [serviceClassName],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        resolverFilePath
      ),
      namedImports: [resolverClassName],
    },
  ];

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: className,
    isExported: true,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'Module',
        arguments: [
          (writer) => {
            writer.block(() => {
              writer.writeLine(
                `providers: [${serviceClassName}, ${resolverClassName}],`
              );
              writer.writeLine(`exports: [${serviceClassName}],`);
            });
          },
        ],
      },
    ],
  };

  project.createSourceFile(sourceFilePath, {
    kind: StructureKind.SourceFile,
    statements: [...imports, classDeclaration],
  });
}
