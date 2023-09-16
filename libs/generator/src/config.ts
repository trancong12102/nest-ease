import { z } from 'zod';
import path from 'path';
import { Project } from 'ts-morph';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';

export const ConfigSchema = z.object({
  prisma: z.object({
    clientPath: z.string(),
    servicePath: z.string(),
  }),
  generator: z.object({
    overwriteCustomFiles: z.boolean().optional(),
  }),
});

export type GeneratorConfig = z.infer<typeof ConfigSchema>;

export async function getGeneratorConfig(srcPath: string) {
  const configTsPath = getConfigPath(srcPath);
  const project = new Project({
    compilerOptions: {
      outDir: path.resolve(os.tmpdir(), uuidv4()),
      declaration: false,
      esModuleInterop: true,
    },
  });
  project.addSourceFileAtPath(configTsPath);
  await project.emit();

  const configSourceFile = project.getSourceFileOrThrow(configTsPath);
  const configEmitOutput = configSourceFile.getEmitOutput();
  if (configEmitOutput.getEmitSkipped()) {
    throw new Error('Invalid nest-ease.config.ts');
  }
  const configJsOutput = configEmitOutput.getOutputFiles()[0];
  if (!configJsOutput) {
    throw new Error('Invalid nest-ease.config.ts');
  }
  const configJsPath = configJsOutput.getFilePath();

  const config = (await import(configJsPath)).default;

  const parsedConfig = ConfigSchema.parse(config);
  const {
    prisma: { servicePath, clientPath },
  } = parsedConfig;

  return {
    ...parsedConfig,
    prisma: {
      servicePath: path.resolve(srcPath, servicePath),
      clientPath: path.resolve(srcPath, clientPath),
    },
  };
}

function getConfigPath(srcPath: string) {
  return path.resolve(srcPath, 'nest-ease.config.ts');
}
