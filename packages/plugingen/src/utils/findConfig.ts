// source: https://github.com/wevm/wagmi/blob/main/packages/cli/src/utils/findConfig.ts
import { findUp } from "find-up";
import { default as fs } from "fs-extra";
import { resolve } from "pathe";

type FindConfigParameters = {
  /** Config file name */
  config?: string;
  /** Config file directory */
  root?: string;
  /** In order of preference files are checked */
  filenames?: string[];
};

/**
 * Resolves path to a CLI config file,
 * in order of preference files are checked
 */
export async function findConfig(parameters: FindConfigParameters = {}) {
  const { config, root, filenames } = parameters;
  const rootDir = resolve(root || process.cwd());
  if (config) {
    const path = resolve(rootDir, config);
    if (fs.pathExistsSync(path)) return path;
    return;
  }
  if (!filenames?.length) {
    throw new Error("Preference list is empty. Failed to find the config.");
  }
  return findUp(filenames, { cwd: rootDir });
}
