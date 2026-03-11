/**
 * Log level constants for controlling diagnostics output.
 * Lower numeric values indicate higher priority (more restrictive filtering).
 *
 * @example
 * ```ts
 * import { LogLevel, setGlobalLoggerConfig } from "@alchemy/common";
 *
 * setGlobalLoggerConfig({ level: LogLevel.DEBUG });
 * ```
 */
export const LogLevel = {
  /** Critical errors only */
  ERROR: 0,
  /** Warnings and errors */
  WARN: 1,
  /** Informational messages, warnings, and errors */
  INFO: 2,
  /** Debug messages and all above */
  DEBUG: 3,
  /** All messages including verbose details */
  VERBOSE: 4,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * Configuration for redacting sensitive data in log output.
 */
export type RedactConfig = {
  /** Predicate function to test if a key should be redacted. Returns true if the key should be redacted. */
  keys?: (key: string) => boolean;
  /** Function to replace redacted values. Defaults to returning "[REDACTED]". */
  replacer?: (value: unknown, key?: string) => unknown;
};

/**
 * Configuration for the diagnostics logging system.
 * All properties are optional and will use sensible defaults if not provided.
 */
export type DiagnosticsConfig = {
  /** Minimum log level to emit. Defaults to INFO in development, ERROR in production. */
  level?: LogLevel;
  /** Configuration for redacting sensitive data in logs. */
  redact?: RedactConfig;
  /** Array of sink functions to receive log entries. Defaults to console sink. */
  sinks?: Array<(entry: LogEntry) => void>;
  /** Disable telemetry headers in requests. Defaults to false. */
  disableTelemetryHeaders?: boolean;
  /** Array of exact namespace strings to allow. If undefined or empty, all namespaces are enabled. Example: ["aa-infra", "wallet-apis"] */
  enabledNamespaces?: string[];
};

/**
 * Base context attached to all log entries from a logger instance.
 */
export type LoggerContextBase = {
  /** Package name (e.g., "@alchemy/aa-infra") */
  package: string;
  /** Package version (e.g., "1.0.0") */
  version: string;
};

/**
 * A single log entry emitted by the diagnostics logger.
 */
export type LogEntry = {
  /** Timestamp in milliseconds since epoch (Date.now()) */
  ts: number;
  /** Log level of this entry */
  level: LogLevel;
  /** Optional namespace for filtering/grouping (e.g., "aa-infra", "wallet-apis") */
  namespace: string | undefined;
  /** The log message */
  message: string;
  /** Optional structured data attached to this log entry */
  data?: Record<string, unknown>;
  /** Package context (name and version) */
  context: LoggerContextBase;
};

let globalConfig: Required<DiagnosticsConfig> | undefined;

function defaultConfig(): Required<DiagnosticsConfig> {
  const env = (typeof process !== "undefined" && process.env) || {};

  // Default level: INFO in dev, ERROR in prod
  const isDev = env.NODE_ENV === "development";
  const defaultLevel = isDev ? LogLevel.INFO : LogLevel.ERROR;

  let level: LogLevel = defaultLevel;
  const envLevel = env.ALCHEMY_LOG_LEVEL;
  if (envLevel) {
    const normalized = envLevel.toUpperCase() as keyof typeof LogLevel;
    if (normalized in LogLevel) {
      level = LogLevel[normalized];
    } else {
      console.warn(
        `[alchemy/common] Invalid ALCHEMY_LOG_LEVEL value: "${envLevel}". Expected one of: ERROR, WARN, INFO, DEBUG, VERBOSE. Using default: ${isDev ? "INFO" : "ERROR"}`,
      );
    }
  }

  return {
    level,
    redact: {
      keys: (key: string) =>
        /^(authorization|apiKey|jwt|privateKey|secret|password)$/i.test(key),
      replacer: () => "[REDACTED]",
    },
    sinks: [consoleSink],
    disableTelemetryHeaders: false,
    enabledNamespaces: [],
  };
}

/**
 * Gets the current global logger configuration.
 * If not yet initialized, returns default configuration based on environment.
 *
 * @returns {Required<DiagnosticsConfig>} The current global configuration with all fields populated
 * @example
 * ```ts
 * import { getGlobalLoggerConfig } from "@alchemy/common";
 *
 * const config = getGlobalLoggerConfig();
 * console.log("Current log level:", config.level);
 * ```
 */
export function getGlobalLoggerConfig(): Required<DiagnosticsConfig> {
  globalConfig ??= defaultConfig();
  return globalConfig;
}

/**
 * Sets the global logger configuration.
 * Partial configuration is supported - unspecified fields retain their current values.
 *
 * Configuration precedence (highest to lowest):
 * 1. Explicit setGlobalLoggerConfig calls
 * 2. ALCHEMY_LOG_LEVEL environment variable
 * 3. Defaults (INFO in dev, ERROR in prod)
 *
 * @param {DiagnosticsConfig} cfg - Partial configuration to apply
 * @example
 * ```ts
 * import { setGlobalLoggerConfig, LogLevel } from "@alchemy/common";
 *
 * // Set log level only
 * setGlobalLoggerConfig({ level: LogLevel.DEBUG });
 *
 * // Add custom sink
 * setGlobalLoggerConfig({
 *   sinks: [(entry) => console.log(JSON.stringify(entry))]
 * });
 *
 * // Filter to specific namespaces
 * setGlobalLoggerConfig({
 *   enabledNamespaces: ["aa-infra", "wallet-apis"]
 * });
 * ```
 */
export function setGlobalLoggerConfig(cfg: DiagnosticsConfig): void {
  const current = getGlobalLoggerConfig();
  globalConfig = {
    level: cfg.level ?? current.level,
    redact: cfg.redact ?? current.redact,
    sinks: cfg.sinks ?? current.sinks,
    disableTelemetryHeaders:
      cfg.disableTelemetryHeaders ?? current.disableTelemetryHeaders,
    enabledNamespaces:
      "enabledNamespaces" in cfg
        ? (cfg.enabledNamespaces ?? [])
        : current.enabledNamespaces,
  };
}

/**
 * Checks if a given log level is enabled based on current global configuration.
 * Used internally by logger to short-circuit disabled log statements.
 *
 * @param {LogLevel} level - The log level to check
 * @returns {boolean} True if the level is enabled (will be logged), false otherwise
 * @example
 * ```ts
 * import { isLevelEnabled, LogLevel } from "@alchemy/common";
 *
 * if (isLevelEnabled(LogLevel.DEBUG)) {
 *   // Perform expensive debug computation
 * }
 * ```
 */
export function isLevelEnabled(level: LogLevel): boolean {
  return level <= getGlobalLoggerConfig().level;
}

/**
 * Checks if a given namespace is enabled based on current global configuration.
 * Used internally by logger to short-circuit logs from disabled namespaces.
 *
 * @param {string | undefined} namespace - The namespace to check
 * @returns {boolean} True if the namespace is enabled (will be logged), false otherwise
 * @example
 * ```ts
 * import { isNamespaceEnabled } from "@alchemy/common";
 *
 * if (isNamespaceEnabled("aa-infra")) {
 *   // This namespace is enabled
 * }
 * ```
 */
export function isNamespaceEnabled(namespace: string | undefined): boolean {
  const { enabledNamespaces } = getGlobalLoggerConfig();

  // If no filter is set or it's an empty array, all namespaces are enabled
  if (!enabledNamespaces || enabledNamespaces.length === 0) {
    return true;
  }

  // If namespace is undefined, disable it (only named namespaces can be filtered)
  if (namespace === undefined) {
    return false;
  }

  // Check if the namespace is in the enabled list
  return enabledNamespaces.includes(namespace);
}

/**
 * Redacts sensitive keys in an object based on global redaction configuration.
 * Performs deep redaction by recursively processing nested objects and arrays.
 * Default redaction includes: authorization, apiKey, jwt, privateKey, secret, password.
 *
 * @param {Record<string, unknown> | undefined} obj - The object to redact
 * @returns {Record<string, unknown> | undefined} A new object with sensitive values redacted, or undefined if input was undefined
 * @example
 * ```ts
 * import { redactObject } from "@alchemy/common";
 *
 * const data = {
 *   apiKey: "secret123",
 *   userId: "user-456",
 *   nested: { secret: "hidden" }
 * };
 *
 * const redacted = redactObject(data);
 * // { apiKey: "[REDACTED]", userId: "user-456", nested: { secret: "[REDACTED]" } }
 * ```
 */
export function redactObject(
  obj: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!obj) return obj;
  const { keys, replacer } = getGlobalLoggerConfig().redact;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (keys && keys(k)) {
      out[k] = replacer ? replacer(v, k) : "[REDACTED]";
    } else if (Array.isArray(v)) {
      // Recursively redact array elements
      out[k] = v.map((item) =>
        item != null && typeof item === "object"
          ? redactObject(item as Record<string, unknown>)
          : item,
      );
    } else if (v != null && typeof v === "object") {
      // Recursively redact nested objects
      out[k] = redactObject(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Format timestamp as HH:MM:SS.mmm
 *
 * @param {number} ts - Timestamp in milliseconds since epoch
 * @returns {string} Formatted timestamp string
 */
function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Format data as a JSON object for console output.
 * Filters out context fields (package, version) to avoid duplication.
 * Handles BigInt values by converting them to strings.
 *
 * @param {Record<string, unknown> | undefined} data - The data object to format
 * @returns {string} Formatted JSON string with leading space, or empty string if no data
 */
function formatData(data: Record<string, unknown> | undefined): string {
  if (!data || Object.keys(data).length === 0) return "";

  // Filter out context fields (package, version) and create clean object
  const filtered = Object.entries(data)
    .filter(([key]) => key !== "package" && key !== "version")
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, unknown>,
    );

  if (Object.keys(filtered).length === 0) return "";

  return (
    " " +
    JSON.stringify(filtered, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    )
  );
}

/**
 * Default console sink for diagnostics logging.
 * Routes log entries to appropriate console methods based on log level.
 *
 * Format: [HH:MM:SS.mmm] [package@version] message {data}
 *
 * @param {LogEntry} entry - The log entry to output
 * @example
 * ```ts
 * import { consoleSink, setGlobalLoggerConfig } from "@alchemy/common";
 *
 * // Console sink is used by default, but can be explicitly configured
 * setGlobalLoggerConfig({
 *   sinks: [consoleSink]
 * });
 * ```
 */
export function consoleSink(entry: LogEntry): void {
  const { ts, level, message, data, context } = entry;
  const timestamp = formatTimestamp(ts);
  const prefix = `[${timestamp}] [${context.package}@${context.version}]`;
  const dataStr = formatData(data);
  const output = `${prefix} ${message}${dataStr}`;

  switch (level) {
    case LogLevel.ERROR:
      console.error(output);
      break;
    case LogLevel.WARN:
      console.warn(output);
      break;
    case LogLevel.INFO:
      console.info(output);
      break;
    case LogLevel.DEBUG:
      console.debug(output);
      break;
    case LogLevel.VERBOSE:
      console.log(output);
      break;
  }
}
