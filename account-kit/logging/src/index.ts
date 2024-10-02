import { WRITE_KEY } from "./_writeKey.js";
import { createClientLogger } from "./client.js";
import { noopLogger } from "./noop.js";
import { createServerLogger } from "./server.js";
import type { EventLogger, EventsSchema } from "./types";

export type * from "./types.js";

export function createLogger<
  Schema extends EventsSchema
>(): EventLogger<Schema> {
  if (WRITE_KEY == null) {
    // If we don't have a write key, we don't want to log anything
    // This is useful for dev so we don't log dev metrics
    return noopLogger;
  }

  if (typeof window === "undefined") {
    return createServerLogger();
  }

  return createClientLogger();
}
