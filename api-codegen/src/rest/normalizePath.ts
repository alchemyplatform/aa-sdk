import type { PathRules } from "../manifest.js";
import { CodegenError } from "../errors.js";

/**
 * Normalizes an OpenAPI spec path into the Route literal the SDK's REST
 * client uses at runtime. Docs specs embed auth and version prefixes in the
 * path (e.g. "/v3/{apiKey}/getNFTsForOwner"); the runtime uses header auth
 * against base URLs that already carry the prefix, so Routes are relative
 * (e.g. "getNFTsForOwner").
 *
 * Rules, in order: drop `{apiKey}` segments (default on), strip the
 * configured prefix, strip leading slashes.
 *
 * @param {string} specPath The path as it appears in the spec
 * @param {PathRules} [rules] Per-spec normalization rules from the manifest
 * @returns {string} The normalized Route literal
 */
export function normalizePath(specPath: string, rules?: PathRules): string {
  let path = specPath;

  if (rules?.stripApiKeySegment !== false) {
    path = path
      .split("/")
      .filter((segment) => segment !== "{apiKey}")
      .join("/");
  }

  if (rules?.stripPrefix) {
    if (!path.startsWith(rules.stripPrefix)) {
      throw new CodegenError(
        `Path "${specPath}" does not start with configured stripPrefix "${rules.stripPrefix}" ` +
          `(after apiKey-segment removal: "${path}"). The upstream path layout changed — update the manifest.`,
      );
    }
    path = path.slice(rules.stripPrefix.length);
  }

  const route = path.replace(/^\/+/, "");
  if (route.length === 0) {
    throw new CodegenError(
      `Path "${specPath}" normalized to an empty route with rules ${JSON.stringify(rules ?? {})}.`,
    );
  }
  return route;
}
