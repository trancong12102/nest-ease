import { Project, SourceFileStructure, StructureKind } from 'ts-morph';
import { prettierFormat } from '../../utils/prettier-format';

export class ProjectStructure {
  private readonly _projectStructure: Record<string, SourceFileStructure> = {};
  private readonly project: Project;

  constructor(tsConfigFilePath: string) {
    this.project = new Project({
      tsConfigFilePath,
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

  async save() {
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

    await this.project.save();
  }
}
