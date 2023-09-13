import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  Project,
  StructureKind,
} from 'ts-morph';
import { GeneratorOptions } from '../types/generator';
import { ModelMapping } from '../types/dmmf';
import { getClassname } from '../helpers/path/get-classname';
import { ModuleFileKind } from '../enums/module-file-kind';
import { getModuleChildFilePath } from '../helpers/path/get-module-child-file-path';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { isPathExists } from '../utils/is-path-exists';
import { assertGitStatusClean } from '../helpers/git/assert-git-status-clean';

export async function generateModelModule(
  project: Project,
  generatorOptions: GeneratorOptions,
  modelMapping: ModelMapping
) {
  const {
    srcPath,
    config: {
      dangerous: { overwriteCustomFiles },
    },
    gitChangedFiles,
  } = generatorOptions;
  const {
    model: { name: modelName },
  } = modelMapping;

  const classname = getClassname(modelName, ModuleFileKind.Module);
  const sourceFilePath = getModuleChildFilePath(
    srcPath,
    modelName,
    classname,
    ModuleFileKind.Module
  );
  if (!overwriteCustomFiles && (await isPathExists(sourceFilePath))) {
    return;
  }
  assertGitStatusClean(gitChangedFiles, sourceFilePath);

  const serviceClassname = getClassname(modelName, ModuleFileKind.Service);
  const serviceFilepath = getModuleChildFilePath(
    srcPath,
    modelName,
    serviceClassname,
    ModuleFileKind.Service
  );
  const resolverClassname = getClassname(modelName, ModuleFileKind.Resolver);
  const resolverFilepath = getModuleChildFilePath(
    srcPath,
    modelName,
    resolverClassname,
    ModuleFileKind.Resolver
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
        serviceFilepath
      ),
      namedImports: [serviceClassname],
    },
    {
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: getImportModuleSpecifier(
        sourceFilePath,
        resolverFilepath
      ),
      namedImports: [resolverClassname],
    },
  ];

  const classDeclaration: ClassDeclarationStructure = {
    kind: StructureKind.Class,
    name: classname,
    isExported: true,
    decorators: [
      {
        kind: StructureKind.Decorator,
        name: 'Module',
        arguments: [
          (writer) => {
            writer.block(() => {
              writer.writeLine(
                `providers: [${serviceClassname}, ${resolverClassname}],`
              );
              writer.writeLine(`exports: [${serviceClassname}],`);
            });
          },
        ],
      },
    ],
  };

  project.createSourceFile(
    sourceFilePath,
    {
      statements: [...imports, classDeclaration],
    },
    {
      overwrite: true,
    }
  );
}
