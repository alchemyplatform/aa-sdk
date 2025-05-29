import { noopLogger } from "./noop.js";
import type { EventsSchema, InnerLogger, LoggerContext } from "./types";

export function createServerLogger<Schema extends EventsSchema = []>(
  _context: LoggerContext,
): InnerLogger<Schema> {
  // TODO: there is an analytics js node package that we can use, but we'll come back to that later
  // this is harder than client, because on the client we can filter out events that are originating from localhost,
  // whereas here we can't do that as easily
  return noopLogger;
}
