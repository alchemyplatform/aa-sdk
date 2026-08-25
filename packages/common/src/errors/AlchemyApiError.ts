import { AlchemyError } from "./AlchemyError.js";

/** Normalized failure metadata shared across REST and JSON-RPC channels. */
export type AlchemyApiErrorDetails = {
  /** HTTP status code, when the failure was an HTTP response. */
  status?: number;
  /** Provider error code: JSON-RPC `error.code` or a REST error-body code. */
  code?: number | string;
  /** The client-generated X-Alchemy-Client-Request-Id sent with the request. */
  requestId?: string;
  /** Parsed Retry-After hint in milliseconds, when the server provided one. */
  retryAfter?: number;
};

/**
 * The normalized error family for Alchemy API failures. Both the REST channel
 * (AlchemyRestClient → AlchemyServerError/AlchemyFetchError, which extend
 * this class) and SDK JSON-RPC actions surface failures as AlchemyApiError, so
 * consumers can handle status/code/requestId/retryAfter uniformly:
 *
 * ```ts
 * try { ... } catch (e) {
 *   if (e instanceof AlchemyApiError && e.status === 429) {
 *     await sleep(e.retryAfter ?? 1_000);
 *   }
 * }
 * ```
 */
export class AlchemyApiError extends AlchemyError {
  override name = "AlchemyApiError";

  /** HTTP status code, when the failure was an HTTP response. */
  readonly status?: number;
  /** Provider error code: JSON-RPC `error.code` or a REST error-body code. */
  readonly code?: number | string;
  /** The client-generated X-Alchemy-Client-Request-Id sent with the request. */
  readonly requestId?: string;
  /** Parsed Retry-After hint in milliseconds, when the server provided one. */
  readonly retryAfter?: number;

  /**
   * Creates a normalized API error.
   *
   * @param {string} shortMessage The headline error message
   * @param {AlchemyApiErrorDetails & { cause?: Error; details?: string; metaMessages?: string[] }} [args] Failure metadata plus AlchemyError options
   */
  constructor(
    shortMessage: string,
    args: AlchemyApiErrorDetails & {
      cause?: Error;
      details?: string;
      metaMessages?: string[];
    } = {},
  ) {
    const { status, code, requestId, retryAfter, ...baseArgs } = args;
    const metaMessages = [
      ...(baseArgs.metaMessages ?? []),
      ...(requestId ? [`Request ID: ${requestId}`] : []),
    ];
    // AlchemyError takes cause XOR details; forward whichever was provided.
    super(
      shortMessage,
      baseArgs.cause
        ? { cause: baseArgs.cause, metaMessages }
        : { details: baseArgs.details, metaMessages },
    );
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
  }
}
