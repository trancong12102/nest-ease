import path from 'path';
import { Project } from 'ts-morph';
import { generateNestEaseModule } from './generator/generate-nest-ease-module';
import { PrismaGeneratorOptions } from './types/generator.type';
import { formatProject } from './helpers/generator/format-project';
import { logError, logger, logWarning, stylize } from './utils/logger';
import { box } from 'consola/utils';
import { getGeneratorOptions } from './helpers/generator/get-generator-options';
import { version } from './utils/version';
import { assertSchemaFollowNamingConventions } from './helpers/dmmf/assert-schema-follow-naming-conventions';

export async function generate(prismaOptions: PrismaGeneratorOptions) {
  try {
    logger.log(
      box(
        stylize(`NestEase Generator ${stylize(version, 'magenta')}`, 'bold'),
        {
          style: {
            borderColor: 'blue',
          },
        }
      )
    );

    assertSchemaFollowNamingConventions(prismaOptions.dmmf);

    logger.info('Getting generator options...');
    const options = await getGeneratorOptions(prismaOptions);
    const { projectRootPath, overwriteCustomFiles } = options;

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
    logger.info(`Project root path: ${stylize(projectRootPath, 'green')}`);

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
