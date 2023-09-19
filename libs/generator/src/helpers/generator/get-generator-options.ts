import { GeneratorOptions as PrismaGeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import { InternalDmmf } from '../dmmf/internal-dmmf';
import { GeneratorOptions } from '../../types/generator.type';
import { parseGeneratorConfig } from '../../config';
import { getGitChangedFiles } from '../git/get-git-changed-files';
import { parseEnvValue } from '@prisma/internals';
import { logger, logWarning } from '../../utils/logger';
import { colorize } from 'consola/utils';

export async function getGeneratorOptions(
  prismaOptions: PrismaGeneratorOptions
): Promise<GeneratorOptions> {
  const { dmmf, schemaPath, otherGenerators } = prismaOptions;

  const projectRootPath = path.resolve(schemaPath, '../..');
  const srcPath = path.resolve(projectRootPath, 'src');

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

  return {
    ...config,
    gitChangedFiles: overwriteCustomFiles ? await getGitChangedFiles() : [],
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
