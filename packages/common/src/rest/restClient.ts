import { FetchError } from "../errors/FetchError.js";
import { ServerError } from "../errors/ServerError.js";
import { withAlchemyHeaders } from "../utils/headers.js";
import { composeSignals, sleep } from "../utils/signals.js";
import type { QueryParams, RestRequestFn, RestRequestSchema } from "./types.js";

const ALCHEMY_API_URL = "https://api.g.alchemy.com";

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY_MS = 150;
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Parameters for creating an AlchemyRestClient instance.
 */
export type AlchemyRestClientParams = {
  /** API key for Alchemy authentication */
  apiKey?: string;
  /** JWT token for Alchemy authentication */
  jwt?: string;
  /** Custom URL (optional - defaults to Alchemy's chain-agnostic URL, but can be used to override it) */
  url?: string;
  /** Custom headers to be sent with requests */
  headers?: HeadersInit;
  /** Max retry attempts after the initial request (default 3; retries 429/5xx/network only) */
  retryCount?: number;
  /** Base backoff delay in ms, doubled per attempt (default 150) */
  retryDelay?: number;
  /** Per-attempt timeout in ms (default 10000) */
  timeout?: number;
};

/**
 * Serializes a query object to a URL search string. Skips null/undefined
 * values; array values append the key repeatedly (wire keys that need the
 * bracketed form, e.g. "contractAddresses[]", carry the brackets in the key
 * itself).
 *
 * @param {QueryParams | undefined} query The query object
 * @returns {string} A "?key=value..." string, or "" when there is nothing to send
 */
function serializeQuery(query: QueryParams | undefined): string {
  if (!query) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry != null) search.append(key, String(entry));
      }
    } else {
      search.append(key, String(value));
    }
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

/**
 * Parses a Retry-After response header into milliseconds (integer seconds or
 * HTTP-date forms).
 *
 * @param {Response} response The HTTP response
 * @returns {number | undefined} Milliseconds to wait, or undefined when absent/unparseable
 */
function parseRetryAfter(response: Response): number | undefined {
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
function parseErrorCode(bodyText: string): number | string | undefined {
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
 * A client for making requests to Alchemy's non-JSON-RPC endpoints, with
 * typed routes/bodies/queries (via a RestRequestSchema), bounded retries with
 * exponential backoff (429/5xx/network only, honoring Retry-After),
 * per-attempt timeouts, abort support, and a per-request idempotency id sent
 * as X-Alchemy-Client-Request-Id and surfaced on thrown errors.
 */
export class AlchemyRestClient<Schema extends RestRequestSchema> {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly retryCount: number;
  private readonly retryDelay: number;
  private readonly timeout: number;

  /**
   * Creates a new instance of AlchemyRestClient.
   *
   * @param {AlchemyRestClientParams} params - The parameters for configuring the client, including API key, JWT, custom URL, headers, and retry/timeout defaults.
   */
  constructor({
    apiKey,
    jwt,
    url,
    headers,
    retryCount,
    retryDelay,
    timeout,
  }: AlchemyRestClientParams) {
    this.url = url ?? ALCHEMY_API_URL;
    this.headers = new Headers(withAlchemyHeaders({ headers, apiKey, jwt }));
    this.retryCount = retryCount ?? DEFAULT_RETRY_COUNT;
    this.retryDelay = retryDelay ?? DEFAULT_RETRY_DELAY_MS;
    this.timeout = timeout ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Makes an HTTP request to an Alchemy non-JSON-RPC endpoint. Retries
   * 429/5xx/network failures with exponential backoff (honoring Retry-After);
   * other statuses throw immediately. A caller-initiated abort is never
   * retried.
   *
   * @param {RestRequestFn<Schema>} params - The parameters for the request
   * @returns {Promise<unknown>} The response from the request
   */
  public request: RestRequestFn<Schema> = async (params) => {
    const requestId = crypto.randomUUID();
    const retryCount = params.retryCount ?? this.retryCount;
    const retryDelay = params.retryDelay ?? this.retryDelay;
    const timeout = params.timeout ?? this.timeout;

    const headers = new Headers(this.headers);
    headers.set("X-Alchemy-Client-Request-Id", requestId);

    const url = `${this.url}/${params.route}${serializeQuery(
      params.query as QueryParams | undefined,
    )}`;

    for (let attempt = 0; ; attempt++) {
      // Per-attempt timeout; the caller's signal spans all attempts.
      const signal = composeSignals(
        params.signal,
        AbortSignal.timeout(timeout),
      );

      let response: Response;
      try {
        response = await fetch(url, {
          method: params.method,
          body: params.body ? JSON.stringify(params.body) : undefined,
          headers,
          signal,
        });
      } catch (error) {
        // A caller-initiated abort propagates as-is, immediately.
        if (params.signal?.aborted) throw params.signal.reason;
        // Timeout or network failure: retryable.
        if (attempt < retryCount) {
          await sleep((1 << attempt) * retryDelay, params.signal);
          continue;
        }
        throw new FetchError(
          params.route,
          params.method,
          error instanceof Error ? error : undefined,
          { requestId },
        );
      }

      if (response.ok) {
        return response.json();
      }

      const retryAfter = parseRetryAfter(response);
      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && attempt < retryCount) {
        await sleep(retryAfter ?? (1 << attempt) * retryDelay, params.signal);
        continue;
      }

      const bodyText = await response.text();
      throw new ServerError(
        bodyText,
        response.status,
        new Error(response.statusText),
        { requestId, retryAfter, code: parseErrorCode(bodyText) },
      );
    }
  };
}
