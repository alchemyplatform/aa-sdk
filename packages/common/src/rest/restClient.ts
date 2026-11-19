import { FetchError } from "../errors/FetchError.js";
import { ServerError } from "../errors/ServerError.js";
import { withAlchemyHeaders } from "../utils/headers.js";
import type { RestRequestFn, RestRequestSchema } from "./types.js";

const ALCHEMY_API_URL = "https://api.g.alchemy.com";

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
  /**
   * Request timeout in milliseconds (optional - defaults to 10_000, matching
   * the viem http transport default used by the JSON-RPC client). Each
   * request is aborted with a `FetchError` when the timeout elapses without
   * a response, instead of hanging indefinitely on a stalled upstream.
   */
  timeout?: number;
  /**
   * Optional AbortSignal (optional - if provided, takes precedence over
   * `timeout` and applies to every request made by this client instance).
   */
  signal?: AbortSignal;
};

/**
 * A client for making requests to Alchemy's non-JSON-RPC endpoints.
 */
export class AlchemyRestClient<Schema extends RestRequestSchema> {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly timeout: number;
  private readonly signal?: AbortSignal;

  /**
   * Creates a new instance of AlchemyRestClient.
   *
   * @param {AlchemyRestClientParams} params - The parameters for configuring the client, including API key, JWT, custom URL, headers, request timeout, and abort signal.
   */
  constructor({
    apiKey,
    jwt,
    url,
    headers,
    timeout,
    signal,
  }: AlchemyRestClientParams) {
    this.url = url ?? ALCHEMY_API_URL;
    this.headers = new Headers(withAlchemyHeaders({ headers, apiKey, jwt }));
    this.timeout = timeout ?? 10_000;
    this.signal = signal;
  }

  /**
   * Makes an HTTP request to an Alchemy non-JSON-RPC endpoint.
   *
   * Every request is bounded: if no `signal` was provided at construction,
   * an `AbortSignal.timeout(this.timeout)` is applied so a stalled upstream
   * rejects with a `FetchError` instead of hanging forever.
   *
   * @param {RestRequestFn<Schema>} params - The parameters for the request
   * @returns {Promise<unknown>} The response from the request
   */
  public request: RestRequestFn<Schema> = async (params) => {
    const signal = this.signal ?? AbortSignal.timeout(this.timeout);
    const response = await fetch(`${this.url}/${params.route}`, {
      method: params.method,
      body: params.body ? JSON.stringify(params.body) : undefined,
      headers: this.headers,
      signal,
    }).catch((error) => {
      throw new FetchError(params.route, params.method, error);
    });

    if (!response.ok) {
      throw new ServerError(
        await response.text(),
        response.status,
        new Error(response.statusText),
      );
    }

    return response.json();
  };
}
