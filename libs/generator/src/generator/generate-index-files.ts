import { ExportDeclarationStructure, Project, StructureKind } from 'ts-morph';
import { GeneratorOptions } from '../types/generator';
import { getBaseDirectoryPath } from '../helpers/path/get-base-directory-path';
import { getBaseIndexPath } from '../helpers/path/get-base-index-path';
import { getImportModuleSpecifier } from '../helpers/import/get-import-module-specifier';
import { CodeComment } from '../enums/code-comment';
import { BASE_FILE_KINDS } from '../contants/file-kind.const';

export function generateIndexFiles(
  project: Project,
  generatorOptions: GeneratorOptions
) {
  const { srcPath } = generatorOptions;
  const projectFiles = project.getSourceFiles();
  const indexFilePaths: string[] = [];

  for (const kind of BASE_FILE_KINDS) {
    const indexParentDir = getBaseDirectoryPath(srcPath, kind);
    const indexFilePath = getBaseIndexPath(srcPath, kind);
    const exports: ExportDeclarationStructure[] = projectFiles
      .filter((f) => f.getFilePath().startsWith(indexParentDir))
      .map((f) => ({
        kind: StructureKind.ExportDeclaration,
        moduleSpecifier: getImportModuleSpecifier(
          indexFilePath,
          f.getFilePath()
        ),
      }));
    project.createSourceFile(
      indexFilePath,
      {
        statements: [CodeComment.GenratedFileComment, ...exports],
      },
      {
        overwrite: true,
      }
    );
    indexFilePaths.push(indexFilePath);
  }

  const baseIndexFilePath = getBaseIndexPath(srcPath);
  const exports: ExportDeclarationStructure[] = indexFilePaths.map((p) => ({
    kind: StructureKind.ExportDeclaration,
    moduleSpecifier: getImportModuleSpecifier(baseIndexFilePath, p),
  }));

  project.createSourceFile(
    baseIndexFilePath,
    {
      statements: [CodeComment.GenratedFileComment, ...exports],
    },
    {
      overwrite: true,
    }
  );
}
