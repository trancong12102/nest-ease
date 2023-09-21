import { isPathExists } from '../../utils/is-path-exists';
import { getPrvPrismaDmmfPath } from '../path/get-prv-prisma-dmmf-path';
import { readFile } from 'fs-extra';
import { PrismaDMMF } from '../../types/dmmf.type';

export async function getOldDmmf(
  projectRootPath: string
): Promise<PrismaDMMF | undefined> {
  const dmmfPath = getPrvPrismaDmmfPath(projectRootPath);
  const isExists = await isPathExists(dmmfPath);

  return isExists ? JSON.parse(await readFile(dmmfPath, 'utf-8')) : undefined;
}
