import simpleGit from 'simple-git';
import path from 'path';

export async function getGitChangedFiles(): Promise<string[]> {
  const cwd = process.cwd();
  const repo = simpleGit({
    baseDir: cwd,
  });
  const { modified, created } = await repo.status();
  const changedPaths = [...modified, ...created];

  return changedPaths.map((p) => path.resolve(cwd, p));
}
