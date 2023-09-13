import { stat } from 'fs-extra';

export async function isPathExists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (_) {
    /* empty */
  }

  return false;
}
