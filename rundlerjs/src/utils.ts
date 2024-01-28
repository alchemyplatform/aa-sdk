import path from "path";
import { fileURLToPath } from "url";

export const getRundlerBinaryPath = () => {
  const os = process.platform as string;
  const extension = os.includes("darwin") ? "macos" : "ubuntu";

  const __filename = fileURLToPath(import.meta.url);
  const fileBinpath = path.resolve(__filename, "../..", `rundler-${extension}`);

  return fileBinpath;
};
