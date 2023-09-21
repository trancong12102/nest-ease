import { GeneratorOptions as PrismaGeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import { InternalDmmf } from '../dmmf/internal-dmmf';
import { GeneratorOptions } from '../../types/generator.type';
import { parseGeneratorConfig } from '../../config';
import { parseEnvValue } from '@prisma/internals';
import { logger, stylize } from '../../utils/logger';

export async function getGeneratorOptions(
  prismaOptions: PrismaGeneratorOptions
): Promise<GeneratorOptions> {
  const { dmmf, schemaPath, otherGenerators } = prismaOptions;

  const projectRootPath = path.resolve(schemaPath, '../..');
  const srcPath = path.resolve(projectRootPath, 'src');

  logger.info(`Project root path: ${stylize(projectRootPath, 'green')}`);

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

  return {
    ...config,
    dmmf: new InternalDmmf(dmmf),
    srcPath,
    projectRootPath,
    prismaClientPath: prismaClientOutputPath.includes(
      'node_modules/@prisma/client'
    )
      ? '@prisma/client'
      : path.resolve(schemaPath, prismaClientOutputPath, 'index'),
  };
}
