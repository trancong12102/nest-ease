import { Project, SourceFileStructure, StructureKind } from 'ts-morph';
import { prettierFormat } from '../../utils/prettier-format';
import path from 'path';
import { glob } from 'glob';
import { remove } from 'fs-extra';
import { logger, logWarning, stylize } from '../../utils/logger';
import { uniq } from 'ramda';

export class ProjectStructure {
  private readonly _projectStructure: Record<string, SourceFileStructure> = {};
  private readonly project: Project;

  constructor(private readonly projectSourcePath: string) {
    this.project = new Project({
      tsConfigFilePath: path.resolve(projectSourcePath, 'tsconfig.json'),
    });
  }

  addSourceFile(path: string, structure: SourceFileStructure) {
    this._projectStructure[path] = structure;
  }

  getSourceFile(path: string) {
    return this._projectStructure[path];
  }

  isSourceFileExists(path: string) {
    return !!this.getSourceFile(path);
  }

  setSourceFile(path: string, structure: SourceFileStructure) {
    this._projectStructure[path] = structure;
  }

  createSourceFile(path: string, structure?: SourceFileStructure) {
    this._projectStructure[path] = structure || {
      kind: StructureKind.SourceFile,
    };
  }

  async removeUnusedBaseFiles() {
    const basePaths = uniq(
      Object.keys(this._projectStructure).map((p) =>
        p.replace(/\/base\/.+$/, '/base')
      )
    );

    const baseFiles = await glob(
      basePaths.map((p) => path.join(p, '**/*')),
      {
        absolute: true,
        nodir: true,
      }
    );

    const unusedBaseFiles = baseFiles.filter(
      (p) => !this.isSourceFileExists(p)
    );

    if (unusedBaseFiles.length > 0) {
      logWarning(
        `The following redundant files will be removed: \n${stylize(
          unusedBaseFiles.join('\n'),
          'dim'
        )}`
      );
    }
    await Promise.all(unusedBaseFiles.map(async (p) => remove(p)));
  }

  async save() {
    await this.removeUnusedBaseFiles();

    logger.info('Formatting generated files...');
    for (const [filePath, structure] of Object.entries(
      this._projectStructure
    )) {
      if (!structure.statements) {
        continue;
      }

      const sourceFile = this.project.createSourceFile(filePath, structure, {
        overwrite: true,
      });
      sourceFile.replaceWithText(
        await prettierFormat(sourceFile.getFullText(), filePath)
      );
    }

    logger.info('Saving project...');
    await this.project.save();
  }
}
