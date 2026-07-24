/**
 * Restores wire-format bracketed keys ("contractAddresses[]") that the public
 * params surface exposes unbracketed (the inverse of the `Unbracket` mapped
 * type in types.ts). Keys not listed pass through untouched.
 *
 * @param {Record<string, unknown>} params The unbracketed params object
 * @param {string[]} arrayKeys Keys to re-bracket
 * @returns {Record<string, unknown>} The wire-format query object
 */
export function bracketArrayKeys(
  params: Record<string, unknown>,
  arrayKeys: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    out[arrayKeys.includes(key) ? `${key}[]` : key] = value;
  }
  return out;
}
