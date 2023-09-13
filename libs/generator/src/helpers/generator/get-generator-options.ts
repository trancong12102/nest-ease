import { GeneratorOptions as PrismaGeneratorOptions } from '@prisma/generator-helper';
import * as path from 'path';
import { InternalDmmf } from '../dmmf/internal-dmmf';
import { GeneratorOptions } from '../../types/generator';
import { getGeneratorConfig } from '../../config';
import { getGitChangedFiles } from '../git/get-git-changed-files';

export async function getGeneratorOptions(
  prismaOptions: PrismaGeneratorOptions
): Promise<GeneratorOptions> {
  const { dmmf, schemaPath } = prismaOptions;

  const projectRootPath = path.resolve(schemaPath, '../..');
  const srcPath = path.resolve(projectRootPath, 'src');

  return {
    config: await getGeneratorConfig(srcPath),
    gitChangedFiles: await getGitChangedFiles(),
    dmmf: new InternalDmmf(dmmf),
    srcPath,
    projectRootPath,
  };
}
