import path from 'path';
import { Project } from 'ts-morph';
import { generateNestEaseModule } from './generator/generate-nest-ease-module';
import { PrismaGeneratorOptions } from './types/generator.type';
import { formatProject } from './helpers/generator/format-project';
import { logError, logger, logWarning, stylize } from './utils/logger';
import { getGeneratorOptions } from './helpers/generator/get-generator-options';
import { assertSchemaFollowNamingConventions } from './helpers/dmmf/assert-schema-follow-naming-conventions';

export async function generate(prismaOptions: PrismaGeneratorOptions) {
  try {
    console.log(stylize('>> NestEase Generator <<', 'cyan', 'bold'));
    assertSchemaFollowNamingConventions(prismaOptions.dmmf);

    logger.info('Getting generator options...');
    const options = await getGeneratorOptions(prismaOptions);
    const { projectRootPath, overwriteCustomFiles } = options;
    logger.info(`Project root path: ${stylize(projectRootPath, 'green')}`);

    if (overwriteCustomFiles) {
      logWarning(
        `${stylize('overwriteCustomFiles', 'blue')} option is ${stylize(
          'ENABLED',
          'red'
        )}, all your custom code files will be ${stylize(
          'OVERWRITTEN',
          'red'
        )}!`
      );
    }

    const project = new Project({
      tsConfigFilePath: path.resolve(projectRootPath, 'tsconfig.json'),
    });
    await generateNestEaseModule(project, options);

    logger.info('Formatting generated files...');
    await formatProject(project);
    logger.info('Saving generated files...');
    await project.save();
    logger.success(stylize('NestEase Generator finished!', 'green'));
  } catch (e) {
    logError(e);
    throw e;
  }
}
