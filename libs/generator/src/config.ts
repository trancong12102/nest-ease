import { z } from 'zod';
import path from 'path';
import { logger, stylize } from './utils/logger';
import * as swc from '@swc/core';
import { readFile } from 'fs-extra';
import { importStringAsModule } from './utils/import-string-as-module';

export const ConfigSchema = z.object({
  prismaServicePath: z.string(),
});

export type GeneratorConfig = z.infer<typeof ConfigSchema>;
export const CONFIG_FILE_NAME = 'nest-ease.config.ts';

export async function parseGeneratorConfig(
  srcPath: string,
): Promise<GeneratorConfig> {
  const configTsPath = getConfigPath(srcPath);
  logger.info(
    `Parsing generator config from ${stylize(configTsPath, 'green')}...`,
  );
  const sourceCode = await readFile(configTsPath, 'utf-8');
  const { code: emittedConfig } = await swc.transform(sourceCode, {
    filename: configTsPath,
    sourceMaps: false,
    isModule: true,
    module: {
      type: 'commonjs',
      importInterop: 'swc',
    },
    jsc: {
      parser: {
        syntax: 'typescript',
        decorators: false,
        tsx: false,
        dynamicImport: false,
      },
      target: 'es2015',
    },
  });

  const config: GeneratorConfig = (await importStringAsModule(emittedConfig))
    .default;

  try {
    ConfigSchema.parse(config);
  } catch (error) {
    throw new Error(
      `Invalid ${CONFIG_FILE_NAME}:\n${(error as { message: string }).message}`,
    );
  }

  const { prismaServicePath } = config;

  return {
    ...config,
    prismaServicePath: path.resolve(srcPath, prismaServicePath),
  };
}

function getConfigPath(srcPath: string) {
  return path.resolve(srcPath, CONFIG_FILE_NAME);
}
