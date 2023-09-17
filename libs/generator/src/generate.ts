import { Project } from 'ts-morph';
import path from 'path';
import { GeneratorOptions } from './types/generator.type';
import { generateNestEaseModule } from './generator/generate-nest-ease-module';
import { generateIndexFiles } from './generator/generate-index-files';
import { getBaseDirectoryPath } from './helpers/path/get-base-directory-path';
import { remove } from 'fs-extra';

export async function generate(options: GeneratorOptions) {
  const { projectRootPath, srcPath } = options;

  const project = new Project({
    tsConfigFilePath: path.resolve(projectRootPath, 'tsconfig.json'),
  });
  await generateNestEaseModule(project, options);
  generateIndexFiles(project, options);

  await remove(getBaseDirectoryPath(srcPath));
  await project.save();
}
