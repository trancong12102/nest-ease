import prettier from 'prettier';

export async function prettierFormat(
  content: string,
  filepath: string
): Promise<string> {
  const config = await prettier.resolveConfig(filepath, {
    useCache: true,
  });

  return prettier.format(content, {
    filepath,
    ...config,
  });
}
