import path from 'path';
import { Project } from 'ts-morph';
import { generateNestEaseModule } from './generator/generate-nest-ease-module';
import { PrismaGeneratorOptions } from './types/generator.type';
import { formatProject } from './helpers/generator/format-project';
import { logger } from './utils/logger';
import { box, colorize } from 'consola/utils';
import { getIfSchemaFollowNamingConvention } from './helpers/dmmf/get-if-schema-follow-naming-convention';
import { getGeneratorOptions } from './helpers/generator/get-generator-options';
import pkg from '../package.json';

export async function generate(prismaOptions: PrismaGeneratorOptions) {
  logger.log(
    box(
      colorize(
        'bold',
        `NestEase Generator ${colorize('magenta', `v${pkg.version}`)}`
      ),
      {
        style: {
          borderColor: 'blue',
        },
      }
    )
  );

  if (!getIfSchemaFollowNamingConvention(prismaOptions.dmmf.datamodel.models)) {
    throw new Error(
      `Your schema does not follow the naming convention.
Please check the following documentation for more details: ${colorize(
        'green',
        'https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#naming-conventions'
      )}`
    );
  }

  logger.info('Getting generator options...');
  const options = await getGeneratorOptions(prismaOptions);
  const { projectRootPath, overwriteCustomFiles } = options;

  if (overwriteCustomFiles) {
    logger.warn(
      `${colorize('yellow', 'WARNING')}: ${colorize(
        'blue',
        'overwriteCustomFiles'
      )} option is ${colorize(
        'red',
        'ENABLED'
      )}, all your custom code files will be ${colorize('red', 'OVERWRITTEN')}!`
    );
  }
  logger.info(
    `Detected project root path: ${colorize('green', projectRootPath)}`
  );

  const project = new Project({
    tsConfigFilePath: path.resolve(projectRootPath, 'tsconfig.json'),
  });
  await generateNestEaseModule(project, options);

  logger.info('Formatting generated files...');
  await formatProject(project);
  logger.info('Saving generated files...');
  await project.save();
  logger.success(colorize('green', 'All modules are generated successfully!'));
}
