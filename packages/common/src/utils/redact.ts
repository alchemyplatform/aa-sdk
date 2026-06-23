/**
 * Redacts credentials that can appear in URLs: keys embedded in `/v2/{key}` paths
 * RPC paths (when a caller configured a key-bearing url) and apiKey query
 * params. The header-auth paths never put keys in URLs; this protects
 * configured-url escape hatches and any server-echoed text.
 *
 * @param {string} text Any error text that may embed a URL
 * @returns {string} The text with credentials replaced by "[redacted]"
 */
export function redactUrlCredentials(text: string): string {
  return text
    .replace(/(\/v2\/)[A-Za-z0-9_-]+/g, "$1[redacted]")
    .replace(/([?&]apiKey=)[^&\s]+/gi, "$1[redacted]");
}
