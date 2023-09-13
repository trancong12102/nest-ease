import { execa } from './execa';

export async function formatFiles(filePaths: string[]) {
  await execa('prettier', ['--write', ...filePaths], {
    preferLocal: true,
  });
}
