import {
  LogLevel,
  consoleSink,
  getGlobalLoggerConfig,
  isLevelEnabled,
  isNamespaceEnabled,
  redactObject,
  type LoggerContextBase,
  type LogEntry,
} from "./config.js";

/**
 * Lazy message supplier function for expensive log computations.
 * Only evaluated when the log level is enabled.
 *
 * @returns {[string, Record<string, unknown>?]} Tuple of [message, optional data]
 */
type MessageSupplier = () => [string, Record<string, unknown>?];

/**
 * Diagnostics logger instance for developer-facing debugging output.
 * Provides level-based logging (error, warn, info, debug, verbose) with structured data.
 */
export type DiagnosticsLogger = {
  /** Log debug messages for development and troubleshooting */
  debug: (
    msg: string | MessageSupplier,
    data?: Record<string, unknown>,
  ) => void;
  /** Log informational messages for key operations */
  info: (msg: string | MessageSupplier, data?: Record<string, unknown>) => void;
  /** Log warnings for recoverable issues */
  warn: (msg: string | MessageSupplier, data?: Record<string, unknown>) => void;
  /** Log errors for failures */
  error: (
    msg: string | MessageSupplier,
    data?: Record<string, unknown>,
  ) => void;
  /** Log verbose details for very detailed tracing */
  verbose: (
    msg: string | MessageSupplier,
    data?: Record<string, unknown>,
  ) => void;
  /** Create a child logger with additional context merged into all log entries */
  withContext: (extra: Record<string, unknown>) => DiagnosticsLogger;
  /**
   * Wrap a function to measure and log its execution time at DEBUG level.
   * Supports both synchronous and asynchronous functions.
   *
   * @template TArgs - Function argument types
   * @template TRet - Function return type
   * @param name - Name for profiling logs
   * @param func - Function to profile
   * @returns Wrapped function that logs execution time
   */
  profiled<TArgs extends any[], TRet>(
    name: string,
    func: (...args: TArgs) => TRet,
  ): (...args: TArgs) => TRet;
};

/**
 * Parameters for creating a diagnostics logger instance.
 */
export type CreateLoggerParams = LoggerContextBase & {
  /** Optional namespace for filtering/grouping (e.g., "aa-infra", "wallet-apis") */
  namespace?: string;
  /** Optional base context merged into all log entries from this logger */
  baseContext?: Record<string, unknown>;
};

/**
 * Creates a diagnostics logger instance for a package.
 * Loggers emit structured log entries to configured sinks (default: console).
 *
 * All log methods support:
 * - String messages: `logger.info("message", { data })`
 * - Lazy suppliers: `logger.debug(() => ["expensive", computeData()])` (only evaluated when level enabled)
 *
 * @param {CreateLoggerParams} params - Logger configuration
 * @returns {DiagnosticsLogger} A logger instance
 * @example
 * ```ts
 * import { createLogger } from "@alchemy/common";
 *
 * const logger = createLogger({
 *   package: "@alchemy/aa-infra",
 *   version: "1.0.0",
 *   namespace: "aa-infra"
 * });
 *
 * logger.info("processing request", { chainId: 1 });
 * logger.debug("detailed state", { userOp: op });
 *
 * // Child logger with additional context
 * const childLogger = logger.withContext({ requestId: "123" });
 * childLogger.info("step complete"); // includes requestId in all logs
 *
 * // Profile a function
 * const sendWithProfiling = logger.profiled("sendUserOp", sendUserOp);
 * await sendWithProfiling(op); // logs execution time at DEBUG level
 * ```
 */
export function createLogger(params: CreateLoggerParams): DiagnosticsLogger {
  const { namespace, baseContext, ...ctx } = params;

  function emit(
    level: LogLevel,
    msgOrFn: string | MessageSupplier,
    data?: Record<string, unknown>,
  ) {
    if (!isLevelEnabled(level)) return;
    if (!isNamespaceEnabled(namespace)) return;

    let message: string;
    let payload: Record<string, unknown> | undefined = data;

    if (typeof msgOrFn === "function") {
      const [m, d] = msgOrFn();
      message = m;
      payload = d ?? data;
    } else {
      message = msgOrFn;
    }

    const entry: LogEntry = {
      ts: Date.now(),
      level,
      namespace,
      message,
      data: redactObject({ ...(baseContext || {}), ...(payload || {}) }),
      context: ctx,
    };

    for (const sink of getGlobalLoggerConfig().sinks) {
      try {
        sink(entry);
      } catch (e) {
        // Silently continue if a sink throws - don't break other sinks
      }
    }
  }

  const logger: DiagnosticsLogger = {
    debug: (m, d) => emit(LogLevel.DEBUG, m, d),
    info: (m, d) => emit(LogLevel.INFO, m, d),
    warn: (m, d) => emit(LogLevel.WARN, m, d),
    error: (m, d) => emit(LogLevel.ERROR, m, d),
    verbose: (m, d) => emit(LogLevel.VERBOSE, m, d),
    withContext(extra) {
      return createLogger({
        ...params,
        baseContext: { ...(baseContext || {}), ...extra },
      });
    },
    profiled<TArgs extends any[], TRet>(
      name: string,
      func: (...args: TArgs) => TRet,
    ) {
      return function profiledWrapper(this: any, ...args: TArgs): TRet {
        const start = Date.now();
        const result = func.apply(this, args) as TRet;
        const finish = (ok: boolean) => {
          const dur = Date.now() - start;
          const msg = ok ? `profiled ${name}` : `profiled ${name} (failed)`;
          // Use DEBUG for timing
          emit(LogLevel.DEBUG, msg, {
            executionTimeMs: dur,
            functionName: name,
          });
        };
        const maybePromise = result as unknown as { then?: Function };
        if (maybePromise && typeof maybePromise.then === "function") {
          return (result as unknown as Promise<unknown>).then(
            (r) => {
              finish(true);
              return r as TRet;
            },
            (e) => {
              finish(false);
              throw e;
            },
          ) as unknown as TRet;
        }
        finish(true);
        return result as TRet;
      };
    },
  };

  return logger;
}

export { LogLevel, consoleSink };
