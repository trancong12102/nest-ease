import * as prettier from 'prettier';

export async function formatFile(
  filepath: string,
  content: string,
): Promise<string> {
  const config = await prettier.resolveConfig(filepath, {
    useCache: true,
  });

  return prettier.format(content, {
    filepath,
    ...config,
  });
}
