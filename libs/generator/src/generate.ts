import path from 'path';
import { Project } from 'ts-morph';
import { generateNestEaseModule } from './generator/generate-nest-ease-module';
import { GeneratorOptions } from './types/generator.type';
import { formatProject } from './helpers/generator/format-project';

export async function generate(options: GeneratorOptions) {
  const { projectRootPath } = options;

  const project = new Project({
    tsConfigFilePath: path.resolve(projectRootPath, 'tsconfig.json'),
  });
  await generateNestEaseModule(project, options);

  await formatProject(project);
  await project.save();
}
