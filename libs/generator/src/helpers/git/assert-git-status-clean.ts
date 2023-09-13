export function assertGitStatusClean(
  gitChangedFiles: string[],
  filePath: string
) {
  if (gitChangedFiles.includes(filePath)) {
    throw new Error(
      `
ERROR:
  File "${filePath}" is changed.
  Please commit it before running generator or disable options "dangerous.overwriteCustomFiles" to prevent overwriting custom files.
`
    );
  }
}
