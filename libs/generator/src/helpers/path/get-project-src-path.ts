import path from 'path';

export function getProjectSrcPath(projectRootPath: string) {
  return path.resolve(projectRootPath, 'src');
}
