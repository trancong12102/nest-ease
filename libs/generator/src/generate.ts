import path from 'path';
import { Project } from 'ts-morph';
import { generateNestEaseModule } from './generator/generate-nest-ease-module';
import { GeneratorOptions } from './types/generator.type';
import { formatProject } from './helpers/generator/format-project';
import { logger } from './utils/logger';
import { colorize } from 'consola/utils';

export async function generate(options: GeneratorOptions) {
  const { projectRootPath, overwriteCustomFiles } = options;
  if (overwriteCustomFiles) {
    logger.warn(
      colorize(
        'yellow',
        '"overwriteCustomFiles" option is enabled. All your custom code files will be overwritten!'
      )
    );
  }
  logger.info(
    `Modules will be generated in ${colorize('cyan', projectRootPath)}`
  );

  const project = new Project({
    tsConfigFilePath: path.resolve(projectRootPath, 'tsconfig.json'),
  });
  await generateNestEaseModule(project, options);

  logger.info(colorize('magenta', 'Formatting generated files...'));
  await formatProject(project);
  await project.save();
  logger.success(colorize('green', 'All modules are generated successfully!'));
}
