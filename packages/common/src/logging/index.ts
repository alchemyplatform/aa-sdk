import { createLocalLogger } from "./local.js";
import { noopLogger } from "./noop.js";
import type { EventLogger, EventsSchema, LoggerContext } from "./types.js";

export type * from "./types.js";

/**
 * Creates a type-safe event logger with performance profiling capabilities.
 * In v5, this uses local-only logging without external service integration.
 *
 * @template Schema - The events schema defining allowed events and their data structures
 * @param {LoggerContext} context - Context information to attach to all events
 * @returns {EventLogger<Schema>} A fully-featured event logger instance
 *
 * @example
 * ```ts
 * import { createLogger } from "@alchemy/common";
 *
 * type MyEvents = [{
 *   EventName: "user_action";
 *   EventData: { action: string };
 * }];
 *
 * const logger = createLogger<MyEvents>({
 *   package: "@my/package",
 *   version: "1.0.0"
 * });
 *
 * await logger.trackEvent({
 *   name: "user_action",
 *   data: { action: "click" }
 * });
 * ```
 */
export function createLogger<Schema extends EventsSchema = []>(
  context: LoggerContext,
): EventLogger<Schema>;

export function createLogger(context: LoggerContext): EventLogger {
  const innerLogger = (() => {
    try {
      // TODO(v5): Add Segment replacement integration once it's finalized. Local-only logging for now.
      return createLocalLogger(context);
    } catch (e) {
      console.error("[Safe to ignore] failed to initialize metrics", e);
      return noopLogger;
    }
  })();

  const logger: EventLogger = {
    ...innerLogger,
    profiled<TArgs extends any[], TRet>(
      name: string,
      func: (...args: TArgs) => TRet,
    ): (...args: TArgs) => TRet {
      return function (this: any, ...args: TArgs): TRet {
        const start = Date.now();
        const result = func.apply(this, args);
        if (result instanceof Promise) {
          return result.then((res) => {
            innerLogger.trackEvent({
              name: "performance",
              data: {
                executionTimeMs: Date.now() - start,
                functionName: name,
              },
            });

            return res;
          }) as TRet;
        }

        innerLogger.trackEvent({
          name: "performance",
          data: {
            executionTimeMs: Date.now() - start,
            functionName: name,
          },
        });
        return result;
      };
    },
  };

  return logger;
}
