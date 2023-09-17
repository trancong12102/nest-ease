import { Project } from 'ts-morph';
import { prettierFormat } from '../../utils/prettier-format';

export async function formatProject(project: Project) {
  const sourceFiles = project.getSourceFiles();

  for (const sourceFile of sourceFiles) {
    const sourceFilePath = sourceFile.getFilePath();
    const code = sourceFile.getFullText();
    sourceFile.replaceWithText(await prettierFormat(code, sourceFilePath));
  }
}
