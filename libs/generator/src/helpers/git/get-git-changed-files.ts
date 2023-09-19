import simpleGit from 'simple-git';
import path from 'path';
import { logWarning, stylize } from '../../utils/logger';

export async function getGitChangedFiles(): Promise<string[]> {
  const cwd = process.cwd();
  const repo = simpleGit({
    baseDir: cwd,
  });
  logWarning(
    `Executing ${stylize('git add .', 'blue')} for getting changed files...`
  );
  await repo.add('.');
  const { modified, created } = await repo.status();
  const changedPaths = [...modified, ...created];

  return changedPaths.map((p) => path.resolve(cwd, p));
}
