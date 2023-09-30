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
import { formatFile } from '../../utils/format-file';

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

  async save() {
    logger.info('Creating and formatting source files...');
    for (const [filePath, structure] of Object.entries(
      this._projectStructure,
    )) {
      await remove(filePath);
      const sourceFile = this.project.createSourceFile(filePath, structure);
      sourceFile.replaceWithText(
        await formatFile(filePath, sourceFile.getFullText()),
      );
    }

    logger.info('Saving project...');
    await this.project.save();
  }
}
