import { ServerError } from "../errors/ServerError.js";
import { withAlchemyHeaders } from "../utils/headers.js";
import { parseErrorCode, sendWithRetry } from "./httpEngine.js";
import type { QueryParams, RestRequestFn, RestRequestSchema } from "./types.js";

const ALCHEMY_API_URL = "https://api.g.alchemy.com";

export const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_RETRY_DELAY_MS = 150;
export const DEFAULT_TIMEOUT_MS = 10_000;

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
    const headers = new Headers(this.headers);
    headers.set("X-Alchemy-Client-Request-Id", requestId);

    const url = `${this.url}/${params.route}${serializeQuery(
      params.query as QueryParams | undefined,
    )}`;

    const { response, retryAfter } = await sendWithRetry({
      url,
      method: params.method,
      headers,
      body: params.body ? JSON.stringify(params.body) : undefined,
      errorLabel: params.route,
      requestId,
      signal: params.signal,
      retryCount: params.retryCount ?? this.retryCount,
      retryDelay: params.retryDelay ?? this.retryDelay,
      timeout: params.timeout ?? this.timeout,
    });

    if (response.ok) {
      return response.json();
    }

    const bodyText = await response.text();
    throw new ServerError(
      bodyText,
      response.status,
      new Error(response.statusText),
      { requestId, retryAfter, code: parseErrorCode(bodyText) },
    );
  };
}
