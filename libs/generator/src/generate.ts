import { remove } from 'fs-extra';
import path from 'path';
import { Project } from 'ts-morph';
import { generateIndexFiles } from './generator/generate-index-files';
import { generateNestEaseModule } from './generator/generate-nest-ease-module';
import { getBaseDirectoryPath } from './helpers/path/get-base-directory-path';
import { GeneratorOptions } from './types/generator.type';
import { formatProject } from './helpers/generator/format-project';

export async function generate(options: GeneratorOptions) {
  const { projectRootPath, srcPath } = options;

  const project = new Project({
    tsConfigFilePath: path.resolve(projectRootPath, 'tsconfig.json'),
  });
  await generateNestEaseModule(project, options);
  generateIndexFiles(project, options);

  await formatProject(project);
  await remove(getBaseDirectoryPath(srcPath));
  await project.save();
}
