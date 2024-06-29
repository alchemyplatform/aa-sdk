import fs from "fs-extra";
import path from "node:path";

export function getExportedFilePath(baseDir: string, filePath: string) {
  const exportedFilePathTs = path.resolve(
    path.dirname(baseDir),
    filePath.replace(".js", ".ts")
  );
  const exportedFilePathTsx = path.resolve(
    path.dirname(baseDir),
    filePath.replace(".js", ".tsx")
  );

  return fs.existsSync(exportedFilePathTsx)
    ? exportedFilePathTsx
    : exportedFilePathTs;
}
