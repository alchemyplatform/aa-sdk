import { createClientLogger } from "./client.js";
import { createServerLogger } from "./server.js";
import type { EventLogger, EventsSchema } from "./types";

export type * from "./types.js";

export function createLogger<
  Schema extends EventsSchema
>(): EventLogger<Schema> {
  if (typeof window === "undefined") {
    return createServerLogger();
  }

  return createClientLogger();
}
