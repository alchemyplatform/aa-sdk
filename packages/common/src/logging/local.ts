import type { EventsSchema, InnerLogger, LoggerContext } from "./types.js";
import { isClientDevMode } from "./utils.js";

/**
 * Creates a local-only logger that outputs events to the console in development mode.
 * This logger does not send data to external services and is safe for all environments.
 *
 * @template Schema - The events schema defining allowed events and their data structures
 * @param {LoggerContext} context - Context information to attach to all events
 * @returns {InnerLogger<Schema>} A logger instance that logs to console in dev mode
 */
export function createLocalLogger<Schema extends EventsSchema = []>(
  context: LoggerContext,
): InnerLogger<Schema> {
  const isDev = isClientDevMode();

  // Generate a simple anonymous ID for local logging
  const anonId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    _internal: {
      ready: Promise.resolve(),
      anonId,
    },
    trackEvent: async ({ name, data }) => {
      if (isDev) {
        try {
          console.log(`[${context.package}] Event: ${name}`, {
            ...data,
            ...context,
            timestamp: new Date().toISOString(),
          });
        } catch {
          // Silently ignore console logging errors
        }
      }
    },
  };
}
