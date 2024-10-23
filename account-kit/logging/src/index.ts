import { createClientLogger } from "./client.js";
import { noopLogger } from "./noop.js";
import { createServerLogger } from "./server.js";
import type { EventLogger, EventsSchema, LoggerContext } from "./types";

export type * from "./types.js";

export function createLogger<Schema extends EventsSchema = []>(
  context: LoggerContext
): EventLogger<Schema>;

export function createLogger(context: LoggerContext): EventLogger {
  const innerLogger = (() => {
    try {
      return typeof window === "undefined"
        ? createServerLogger(context)
        : createClientLogger(context);
    } catch (e) {
      console.error("[Safe to ignore] failed to initialize metrics", e);
      return noopLogger;
    }
  })();

  const logger: EventLogger = {
    ...innerLogger,
    profiled<TArgs extends any[], TRet>(
      name: string,
      func: (...args: TArgs) => TRet
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
