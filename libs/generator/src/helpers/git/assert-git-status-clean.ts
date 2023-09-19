export function assertGitStatusClean(
  gitChangedFiles: string[],
  filePath: string
) {
  if (gitChangedFiles.includes(filePath)) {
    throw new Error(
      `  File "${filePath}" is changed!
  Please commit it before running generator or disable option "generator.overwriteCustomFiles" to prevent overwriting custom files.`
    );
  }
}
