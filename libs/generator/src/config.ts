import { z } from 'zod';
import path from 'path';
import { ModuleKind, Project } from 'ts-morph';
import * as os from 'os';
import { logger, stylize } from './utils/logger';
import * as crypto from 'crypto';

export const ConfigSchema = z.object({
  prismaServicePath: z.string(),
  overwriteCustomFiles: z.boolean().default(false),
});

export type GeneratorConfig = z.infer<typeof ConfigSchema>;
export const CONFIG_FILE_NAME = 'nest-ease.config.ts';

export async function parseGeneratorConfig(
  srcPath: string
): Promise<GeneratorConfig> {
  const configTsPath = getConfigPath(srcPath);
  logger.info(
    `Parsing generator config from ${stylize(configTsPath, 'green')}...`
  );
  const project = new Project({
    compilerOptions: {
      outDir: path.resolve(os.tmpdir(), crypto.randomUUID()),
      declaration: false,
      esModuleInterop: true,
      module: ModuleKind.CommonJS,
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

  const config: GeneratorConfig = (await import(configJsPath)).default;

  try {
    ConfigSchema.parse(config);
  } catch (error) {
    throw new Error(
      `Invalid ${CONFIG_FILE_NAME}:\n${(error as { message: string }).message}`
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
