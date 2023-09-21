import { generateRootModule } from './generator/generate-root-module';
import { PrismaGeneratorOptions } from './types/generator.type';
import { logError, logger, stylize } from './utils/logger';
import { getGeneratorOptions } from './helpers/generator/get-generator-options';
import { assertSchemaFollowNamingConventions } from './helpers/dmmf/assert-schema-follow-naming-conventions';
import { ProjectStructure } from './helpers/project-structure/project-structure';

export async function generate(prismaOptions: PrismaGeneratorOptions) {
  try {
    console.log(stylize('>> NestEase Generator <<', 'cyan', 'bold'));
    assertSchemaFollowNamingConventions(prismaOptions.dmmf);

    logger.info('Getting generator options...');
    const options = await getGeneratorOptions(prismaOptions);
    const { projectRootPath } = options;

    const project = new ProjectStructure(projectRootPath);
    await generateRootModule(project, options);

    await project.save();
    logger.success(stylize('NestEase Generator finished!', 'green'));
  } catch (e) {
    logError(e);
    throw e;
  }
}
