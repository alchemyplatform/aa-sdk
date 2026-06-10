import { AlchemyApiError } from "@alchemy/common";
import { HttpRequestError, RpcRequestError } from "viem";

/**
 * Redacts credentials that can appear in URLs: keys embedded in "/v2/<key>"
 * RPC paths (when a caller configured a key-bearing url) and apiKey query
 * params. The header-auth paths never put keys in URLs; this protects the
 * configured-url escape hatch.
 *
 * @param {string} text Any error text that may embed a URL
 * @returns {string} The text with credentials replaced by "[redacted]"
 */
export function redactUrlCredentials(text: string): string {
  return text
    .replace(/(\/v2\/)[A-Za-z0-9_-]+/g, "$1[redacted]")
    .replace(/([?&]apiKey=)[^&\s]+/gi, "$1[redacted]");
}

/**
 * Normalizes viem JSON-RPC failures into the {@link AlchemyApiError} family
 * (the REST channel is normalized inside AlchemyRestClient), so consumers
 * handle one error shape across both channels. URL-bearing viem errors are
 * carried as redacted details rather than as a cause, so credential-bearing
 * URLs never leak through error chains.
 *
 * @param {unknown} error The error thrown by `client.request`
 * @returns {never} Always throws
 */
export function wrapRpcError(error: unknown): never {
  if (error instanceof AlchemyApiError) {
    throw error;
  }
  if (error instanceof RpcRequestError) {
    throw new AlchemyApiError(redactUrlCredentials(error.shortMessage), {
      code: error.code,
      details: redactUrlCredentials(error.details),
    });
  }
  if (error instanceof HttpRequestError) {
    throw new AlchemyApiError(redactUrlCredentials(error.shortMessage), {
      status: error.status,
      details: redactUrlCredentials(error.details ?? ""),
    });
  }
  throw error;
}
