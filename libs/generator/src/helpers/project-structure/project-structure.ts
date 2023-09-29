import {
  IndentationText,
  Project,
  QuoteKind,
  SourceFileStructure,
  StructureKind,
} from 'ts-morph';
import path from 'path';
import { remove } from 'fs-extra';
import { logger } from '../../utils/logger';
import { uniq } from 'ramda';
import { formatFile } from '../../utils/format-file';
import { getSourceFileName } from '../path/get-source-file-name';
import { getModuleFileClassName } from '../path/get-module-file-class-name';
import { ROOT_MODULE } from '../../generator/generate-root-module';

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

  async removeBaseFiles() {
    const basePaths = uniq(
      Object.keys(this._projectStructure)
        .filter(
          (p) =>
            BASE_PATH_REGEX.test(p) ||
            p.includes(
              getSourceFileName(
                getModuleFileClassName(ROOT_MODULE, 'Module'),
                'Module',
              ),
            ),
        )
        .map((p) => p.replace(BASE_PATH_REGEX, '/base')),
    );

    await Promise.all(basePaths.map(async (p) => remove(p)));
  }

  async save() {
    await this.removeBaseFiles();

    logger.info('Creating and formatting source files...');
    for (const [filePath, structure] of Object.entries(
      this._projectStructure,
    )) {
      const sourceFile = this.project.createSourceFile(filePath, structure);
      sourceFile.replaceWithText(
        await formatFile(filePath, sourceFile.getFullText()),
      );
    }

    logger.info('Saving project...');
    await this.project.save();
  }
}
