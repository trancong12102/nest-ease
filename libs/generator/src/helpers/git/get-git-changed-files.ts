import simpleGit from 'simple-git';
import path from 'path';

export async function getGitChangedFiles() {
  const cwd = process.cwd();
  const repo = simpleGit({
    baseDir: cwd,
  });
  const status = await repo.status();

  return status.files.map((file) => path.resolve(cwd, file.path));
}
