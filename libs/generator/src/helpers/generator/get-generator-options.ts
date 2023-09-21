import { GeneratorOptions as PrismaGeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import { InternalDmmf } from '../dmmf/internal-dmmf';
import { GeneratorOptions } from '../../types/generator.type';
import { parseGeneratorConfig } from '../../config';
import { getGitChangedFiles } from '../git/get-git-changed-files';
import { parseEnvValue } from '@prisma/internals';
import { logger, logWarning, stylize } from '../../utils/logger';
import { getOldDmmf } from '../dmmf/get-old-dmmf';
import { getPrvPrismaDmmfPath } from '../path/get-prv-prisma-dmmf-path';

export async function getGeneratorOptions(
  prismaOptions: PrismaGeneratorOptions
): Promise<GeneratorOptions> {
  const { dmmf, schemaPath, otherGenerators } = prismaOptions;

  const projectRootPath = path.resolve(schemaPath, '../..');
  const srcPath = path.resolve(projectRootPath, 'src');

  logger.info(`Project root path: ${stylize(projectRootPath, 'green')}`);

  logger.info(
    `Looking for ${stylize('DMMF', 'blue', 'bold')} at ${stylize(
      getPrvPrismaDmmfPath(projectRootPath),
      'green'
    )}...`
  );
  const oldDmmf = await getOldDmmf(projectRootPath);
  if (oldDmmf) {
    logger.info(
      `Found ${stylize(
        'DMMF',
        'blue',
        'bold'
      )}, generator will use it for caching when possible!`
    );
  } else {
    logWarning(
      `Not found ${stylize(
        'DMMF',
        'blue',
        'bold'
      )}, generator will still work but without caching!`
    );
  }

  const prismaClientGenerator = otherGenerators.find(
    ({ provider }) => parseEnvValue(provider) === 'prisma-client-js'
  );
  if (!prismaClientGenerator) {
    throw new Error(
      `Unable to find prisma-client-js generator in schema.prisma`
    );
  }
  const { output: prismaClientGeneratorOutput } = prismaClientGenerator;
  if (!prismaClientGeneratorOutput) {
    throw new Error(
      `Unable to find output in prisma-client-js generator in schema.prisma`
    );
  }
  const prismaClientOutputPath = parseEnvValue(prismaClientGeneratorOutput);

  const config = await parseGeneratorConfig(srcPath);
  const { overwriteCustomFiles } = config;

  if (overwriteCustomFiles) {
    logWarning(
      `${stylize('overwriteCustomFiles', 'blue')} option is ${stylize(
        'ENABLED',
        'red'
      )}, all your custom code files will be ${stylize('OVERWRITTEN', 'red')}!`
    );
  }

  return {
    ...config,
    gitChangedFiles: overwriteCustomFiles ? await getGitChangedFiles() : [],
    dmmf: new InternalDmmf(dmmf, oldDmmf),
    srcPath,
    projectRootPath,
    prismaClientPath: prismaClientOutputPath.includes(
      'node_modules/@prisma/client'
    )
      ? '@prisma/client'
      : path.resolve(schemaPath, prismaClientOutputPath, 'index'),
  };
}
