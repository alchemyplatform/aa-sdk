export { createLogger, LogLevel, consoleSink } from "./logger.js";
export type { DiagnosticsLogger } from "./logger.js";
export {
  setGlobalLoggerConfig,
  getGlobalLoggerConfig,
  isLevelEnabled,
  isNamespaceEnabled,
  redactObject,
} from "./config.js";
export type {
  LogEntry,
  DiagnosticsConfig,
  RedactConfig,
  LoggerContextBase,
} from "./config.js";

// Testing utilities
export { InMemorySink } from "./sinks.js";

export type * from "./types.js";
