import { z } from 'zod';
import path from 'path';
import { Project } from 'ts-morph';
import { v4 as uuidV4 } from 'uuid';
import * as os from 'os';
import { logger } from './utils/logger';
import { colorize } from 'consola/utils';

export const ConfigSchema = z.object({
  prismaServicePath: z.string(),
  overwriteCustomFiles: z.boolean().default(false),
});

export type GeneratorConfig = z.infer<typeof ConfigSchema>;
export const CONFIG_FILE_NAME = 'nest-ease.config.ts';

export async function getGeneratorConfig(
  srcPath: string
): Promise<GeneratorConfig> {
  const configTsPath = getConfigPath(srcPath);
  logger.info(`Parsing ${colorize('green', configTsPath)}...`);
  const project = new Project({
    compilerOptions: {
      outDir: path.resolve(os.tmpdir(), uuidV4()),
      declaration: false,
      esModuleInterop: true,
    },
  });
  project.addSourceFileAtPath(configTsPath);
  await project.emit();

  const configSourceFile = project.getSourceFileOrThrow(configTsPath);
  const configEmitOutput = configSourceFile.getEmitOutput();
  if (configEmitOutput.getEmitSkipped()) {
    throw new Error(`Invalid ${CONFIG_FILE_NAME}`);
  }
  const configJsOutput = configEmitOutput.getOutputFiles()[0];
  if (!configJsOutput) {
    throw new Error(`Invalid ${CONFIG_FILE_NAME}`);
  }
  const configJsPath = configJsOutput.getFilePath();

  const config = (await import(configJsPath)).default;

  const parsedConfig = ConfigSchema.parse(config);
  const { prismaServicePath } = parsedConfig;

  return {
    ...parsedConfig,
    prismaServicePath: path.resolve(srcPath, prismaServicePath),
  };
}

function getConfigPath(srcPath: string) {
  return path.resolve(srcPath, CONFIG_FILE_NAME);
}
