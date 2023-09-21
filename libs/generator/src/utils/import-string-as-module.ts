import path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { remove, writeFile } from 'fs-extra';

export async function importStringAsModule(moduleContent: string) {
  const tmpSourcePath = `${path.resolve(os.tmpdir(), crypto.randomUUID())}.js`;
  await writeFile(tmpSourcePath, moduleContent);

  try {
    return await import(tmpSourcePath);
  } finally {
    await remove(tmpSourcePath);
  }
}
