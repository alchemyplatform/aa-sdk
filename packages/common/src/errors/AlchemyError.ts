import { VERSION } from "../version.js";

type AlchemyErrorParameters = {
  docsPath?: string;
  docsSlug?: string;
  metaMessages?: string[];
} & (
  | {
      cause?: never;
      details?: string;
    }
  | {
      cause: Error;
      details?: never;
    }
);

/**
 * Dependency-free error root for SDK surfaces that must not pull in viem at
 * runtime (the Data APIs core and the shared REST/JSON-RPC runtime). Message
 * shape matches {@link BaseError} (short message, meta messages, docs link,
 * details, version line), and `walk()` provides viem-compatible cause-chain
 * traversal — but the class extends plain `Error`.
 *
 * Wallet-facing errors keep extending {@link BaseError} (viem-based); this
 * root exists so `AlchemyApiError` and friends stay viem-free.
 */
export class AlchemyError extends Error {
  override name = "AlchemyError";
  readonly version = VERSION;
  readonly shortMessage: string;
  readonly details?: string;
  readonly docsPath?: string;
  readonly metaMessages?: string[];

  /**
   * Creates an error with the SDK's standard message formatting.
   *
   * @param {string} shortMessage The headline error message
   * @param {AlchemyErrorParameters} args Docs pointers, meta messages, and cause XOR details
   */
  constructor(shortMessage: string, args: AlchemyErrorParameters = {}) {
    const details =
      args.cause instanceof AlchemyError
        ? args.cause.details
        : args.cause?.message
          ? args.cause.message
          : args.details;
    const docsPath =
      args.cause instanceof AlchemyError
        ? args.cause.docsPath || args.docsPath
        : args.docsPath;

    super(
      [
        shortMessage || "An error occurred.",
        "",
        ...(args.metaMessages ? [...args.metaMessages, ""] : []),
        ...(docsPath
          ? [
              `Docs: https://www.alchemy.com/docs/wallets${docsPath}${
                args.docsSlug ? `#${args.docsSlug}` : ""
              }`,
            ]
          : []),
        ...(details ? [`Details: ${details}`] : []),
        `Version: ${VERSION}`,
      ].join("\n"),
      args.cause ? { cause: args.cause } : undefined,
    );

    this.shortMessage = shortMessage;
    this.details = details;
    this.docsPath = docsPath;
    this.metaMessages = args.metaMessages;
  }

  /**
   * Walks the cause chain: with no predicate, returns the deepest error;
   * with a predicate, returns the first matching error or null (viem
   * BaseError-compatible semantics).
   *
   * @param {Function} [fn] Optional predicate over each error in the chain
   * @returns {Error | null} The deepest error, the first match, or null
   */
  walk(fn?: (err: unknown) => boolean): Error | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let err: Error = this;
    while (true) {
      if (fn?.(err)) return err;
      if (!(err.cause instanceof Error)) return fn ? null : err;
      err = err.cause;
    }
  }
}
