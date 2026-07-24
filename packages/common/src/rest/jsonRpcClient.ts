import { AlchemyApiError } from "../errors/AlchemyApiError.js";
import { AlchemyServerError } from "../errors/AlchemyServerError.js";
import { withAlchemyHeaders } from "../utils/headers.js";
import { redactUrlCredentials } from "../utils/redact.js";
import { parseErrorCode, sendWithRetry } from "./httpEngine.js";
import {
  DEFAULT_RETRY_COUNT,
  DEFAULT_RETRY_DELAY_MS,
  DEFAULT_TIMEOUT_MS,
  type AlchemyRestClientParams,
} from "./restClient.js";
import type { RestRequestOptions } from "./types.js";

/**
 * A typed JSON-RPC schema: a tuple of method entries. Structurally compatible
 * with viem's RpcSchema shape, but defined here so consumers need no viem
 * dependency.
 */
export type JsonRpcSchema = readonly {
  Method: string;
  Parameters?: unknown;
  ReturnType: unknown;
}[];

export type JsonRpcRequestFn<Schema extends JsonRpcSchema> = <
  method extends Schema[number]["Method"],
>(
  args: {
    method: method;
    params: Extract<Schema[number], { Method: method }>["Parameters"];
  },
  options?: RestRequestOptions,
) => Promise<Extract<Schema[number], { Method: method }>["ReturnType"]>;

/** Parameters for creating an AlchemyJsonRpcClient (URL is required: JSON-RPC is always endpoint-scoped). */
export type AlchemyJsonRpcClientParams = AlchemyRestClientParams & {
  url: string;
};

/**
 * A typed JSON-RPC client over the same HTTP engine as
 * {@link AlchemyRestClient}: bounded retries on 429/5xx/network failures
 * (honoring Retry-After), per-attempt timeouts, abort support, and a
 * per-request X-Alchemy-Client-Request-Id surfaced on thrown errors.
 * JSON-RPC-level errors (an `error` object on HTTP 200) are deterministic and
 * are never retried; they throw {@link AlchemyApiError} carrying the RPC
 * error code.
 */
export class AlchemyJsonRpcClient<Schema extends JsonRpcSchema> {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly retryCount: number;
  private readonly retryDelay: number;
  private readonly timeout: number;
  private nextId = 1;

  /**
   * Creates a new instance of AlchemyJsonRpcClient.
   *
   * @param {AlchemyJsonRpcClientParams} params - Endpoint URL plus auth, headers, and retry/timeout defaults.
   */
  constructor({
    apiKey,
    jwt,
    url,
    headers,
    retryCount,
    retryDelay,
    timeout,
  }: AlchemyJsonRpcClientParams) {
    this.url = url;
    this.headers = new Headers(withAlchemyHeaders({ headers, apiKey, jwt }));
    this.headers.set("Content-Type", "application/json");
    this.retryCount = retryCount ?? DEFAULT_RETRY_COUNT;
    this.retryDelay = retryDelay ?? DEFAULT_RETRY_DELAY_MS;
    this.timeout = timeout ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Sends a JSON-RPC request and returns its result.
   *
   * @param {object} args - The request to send
   * @param {string} args.method - The JSON-RPC method name
   * @param {unknown} args.params - The positional params for the method
   * @param {RestRequestOptions} [options] - Per-request signal and retry/timeout overrides
   * @returns {Promise<unknown>} The JSON-RPC result
   */
  public request: JsonRpcRequestFn<Schema> = async (
    { method, params },
    options,
  ) => {
    const requestId = crypto.randomUUID();
    const headers = new Headers(this.headers);
    headers.set("X-Alchemy-Client-Request-Id", requestId);

    const { response, retryAfter } = await sendWithRetry({
      url: this.url,
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: this.nextId++,
        method,
        params,
      }),
      errorLabel: method,
      requestId,
      signal: options?.signal,
      retryCount: options?.retryCount ?? this.retryCount,
      retryDelay: options?.retryDelay ?? this.retryDelay,
      timeout: options?.timeout ?? this.timeout,
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new AlchemyServerError(
        redactUrlCredentials(bodyText),
        response.status,
        new Error(response.statusText),
        { requestId, retryAfter, code: parseErrorCode(bodyText) },
      );
    }

    const body = await response.json();
    if (body?.error != null) {
      throw new AlchemyApiError(
        redactUrlCredentials(body.error.message ?? "JSON-RPC error"),
        { code: body.error.code, requestId },
      );
    }
    if (!("result" in (body ?? {}))) {
      throw new AlchemyApiError("Malformed JSON-RPC response", { requestId });
    }
    return body.result;
  };
}
