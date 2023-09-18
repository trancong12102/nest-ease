import simpleGit from 'simple-git';
import path from 'path';
import { logger } from '../../utils/logger';
import { colorize } from 'consola/utils';

export async function getGitChangedFiles(): Promise<string[]> {
  const cwd = process.cwd();
  const repo = simpleGit({
    baseDir: cwd,
  });
  logger.warn(
    `${colorize('yellow', 'WARNING')}: Executing ${colorize(
      'blue',
      'git add .'
    )} for getting changed files...`
  );
  await repo.add('.');
  const { modified, created } = await repo.status();
  const changedPaths = [...modified, ...created];

  return changedPaths.map((p) => path.resolve(cwd, p));
}
