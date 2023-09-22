import {
  IndentationText,
  Project,
  QuoteKind,
  SourceFileStructure,
  StructureKind,
} from 'ts-morph';
import path from 'path';
import { remove } from 'fs-extra';
import { logger, logWarning, stylize } from '../../utils/logger';
import { uniq } from 'ramda';
import { glob } from 'fast-glob';

const BASE_PATH_REGEX = /\/base\/.+$/;

export class ProjectStructure {
  private readonly _projectStructure: Record<string, SourceFileStructure> = {};
  private readonly project: Project;

  constructor(projectSourcePath: string) {
    this.project = new Project({
      tsConfigFilePath: path.resolve(projectSourcePath, 'tsconfig.json'),
      manipulationSettings: {
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
        useTrailingCommas: true,
        quoteKind: QuoteKind.Single,
        indentationText: IndentationText.TwoSpaces,
      },
    });
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
      Object.keys(this._projectStructure)
        .filter((p) => BASE_PATH_REGEX.test(p))
        .map((p) => p.replace(BASE_PATH_REGEX, '/base'))
    );

    const baseFiles = await glob(
      basePaths.map((p) => path.join(p, '**/*')),
      {
        absolute: true,
        onlyFiles: true,
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

    for (const [filePath, structure] of Object.entries(
      this._projectStructure
    )) {
      if (!structure.statements) {
        continue;
      }

      this.project.createSourceFile(filePath, structure, {
        overwrite: true,
      });
    }

    logger.info('Saving project...');
    await this.project.save();
  }
}
