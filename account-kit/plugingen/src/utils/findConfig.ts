// source: https://github.com/wevm/wagmi/blob/main/packages/cli/src/utils/findConfig.ts
import { findUp } from "find-up";
import { default as fs } from "fs-extra";
import { resolve } from "pathe";

// Do not reorder
// In order of preference files are checked
const configFiles = [
  "plugingen.config.ts",
  "plugingen.config.js",
  "plugingen.config.mjs",
  "plugingen.config.mts",
];

type FindConfigParameters = {
  /** Config file name */
  config?: string;
  /** Config file directory */
  root?: string;
};

/**
 * Resolves path to plugingen CLI config file.
 *
 * @param {FindConfigParameters | undefined} parameters - optional override parameters for finding the config object
 * @returns {string} the path to the config file
 */
export async function findConfig(parameters: FindConfigParameters = {}) {
  const { config, root } = parameters;
  const rootDir = resolve(root || process.cwd());
  if (config) {
    const path = resolve(rootDir, config);
    if (fs.pathExistsSync(path)) return path;
    return;
  }
  return findUp(configFiles, { cwd: rootDir });
}
