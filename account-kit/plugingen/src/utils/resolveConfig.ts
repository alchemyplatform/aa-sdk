import { bundleRequire } from "bundle-require";
import type { Config } from "../config";
import type { MaybeArray } from "../types";

type ResolveConfigParameters = {
  /** Path to config file */
  configPath: string;
};

/**
 * Bundles and returns config object from path.
 *
 * @param {ResolveConfigParameters} parameters - Parameters to resolve config
 * @returns {Promise<MaybeArray<Config>>} an array of the config objects
 */
export async function resolveConfig(
  parameters: ResolveConfigParameters,
): Promise<MaybeArray<Config>> {
  const { configPath } = parameters;
  const res = await bundleRequire({ filepath: configPath });
  let config = res.mod.default;
  if (config.default) config = config.default;
  if (typeof config !== "function") return config;
  return await config();
}
