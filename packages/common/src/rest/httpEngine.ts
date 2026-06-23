import { AlchemyFetchError } from "../errors/AlchemyFetchError.js";
import { composeSignals, sleep } from "../utils/signals.js";

// Internal request engine shared by AlchemyRestClient and
// AlchemyJsonRpcClient. Not exported from the package.

/** Parameters for one logical request (spanning retries). */
export type HttpSendParams = {
  url: string;
  method: string;
  /** Final headers, including auth and X-Alchemy-Client-Request-Id. */
  headers: Headers;
  body?: string;
  /** Label used in AlchemyFetchError messages — a route or RPC method, never a URL. */
  errorLabel: string;
  requestId: string;
  signal?: AbortSignal;
  retryCount: number;
  retryDelay: number;
  timeout: number;
};

/**
 * Parses a Retry-After response header into milliseconds (integer seconds or
 * HTTP-date forms).
 *
 * @param {Response} response The HTTP response
 * @returns {number | undefined} Milliseconds to wait, or undefined when absent/unparseable
 */
export function parseRetryAfter(response: Response): number | undefined {
  const header = response.headers.get("Retry-After");
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

/**
 * Best-effort extraction of an error code from a JSON error body.
 *
 * @param {string} bodyText The raw response body
 * @returns {number | string | undefined} The error code, when present
 */
export function parseErrorCode(bodyText: string): number | string | undefined {
  try {
    const parsed = JSON.parse(bodyText);
    const code = parsed?.error?.code ?? parsed?.code;
    return typeof code === "number" || typeof code === "string"
      ? code
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sends a request with the SDK's standard retry policy: 429/5xx/network
 * failures retried with exponential backoff (honoring Retry-After), a
 * per-attempt timeout merged with the caller's signal, and caller-initiated
 * aborts rethrown immediately without retrying. Resolves with the final
 * Response — ok, or non-ok once the policy is exhausted or the status is
 * non-retryable — leaving error mapping to the typed frontends. Throws
 * AlchemyFetchError when network/timeout failures exhaust the retries.
 *
 * @param {HttpSendParams} params The request and retry configuration
 * @returns {Promise<{ response: Response; retryAfter?: number }>} The final response and any Retry-After hint
 */
export async function sendWithRetry({
  url,
  method,
  headers,
  body,
  errorLabel,
  requestId,
  signal: callerSignal,
  retryCount,
  retryDelay,
  timeout,
}: HttpSendParams): Promise<{ response: Response; retryAfter?: number }> {
  for (let attempt = 0; ; attempt++) {
    // Per-attempt timeout; the caller's signal spans all attempts.
    const signal = composeSignals(callerSignal, AbortSignal.timeout(timeout));

    let response: Response;
    try {
      response = await fetch(url, { method, body, headers, signal });
    } catch (error) {
      // A caller-initiated abort propagates as-is, immediately.
      if (callerSignal?.aborted) throw callerSignal.reason;
      // Timeout or network failure: retryable.
      if (attempt < retryCount) {
        await sleep((1 << attempt) * retryDelay, callerSignal);
        continue;
      }
      throw new AlchemyFetchError(
        errorLabel,
        method,
        error instanceof Error ? error : undefined,
        { requestId },
      );
    }

    if (response.ok) {
      return { response };
    }

    const retryAfter = parseRetryAfter(response);
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < retryCount) {
      await sleep(retryAfter ?? (1 << attempt) * retryDelay, callerSignal);
      continue;
    }
    return { response, retryAfter };
  }
}
