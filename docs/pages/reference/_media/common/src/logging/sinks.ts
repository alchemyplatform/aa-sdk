import type { LogEntry } from "./config.js";

/**
 * In-memory sink for testing purposes.
 * Captures all log entries in an array that can be inspected in tests.
 *
 * **Note:** This is primarily intended for testing SDK integrations.
 * Most applications should use the default console sink.
 *
 * @example
 * ```ts
 * import { InMemorySink, setGlobalLoggerConfig, createLogger } from "@alchemy/common";
 *
 * // In tests
 * const sink = new InMemorySink();
 *
 * setGlobalLoggerConfig({
 *   sinks: [sink.sink]
 * });
 *
 * const logger = createLogger({
 *   package: "@alchemy/aa-infra",
 *   version: "1.0.0",
 *   namespace: "aa-infra"
 * });
 *
 * logger.info("test message");
 *
 * // Inspect captured logs
 * expect(sink.count).toBe(1);
 * expect(sink.latest()?.message).toBe("test message");
 * ```
 */
export class InMemorySink {
  /**
   * Array of captured log entries
   */
  public entries: LogEntry[] = [];

  /**
   * Creates a new InMemorySink instance.
   * Binds the sink method to the instance for use as a callback.
   */
  constructor() {
    this.sink = this.sink.bind(this);
  }

  /**
   * The sink function to pass to setGlobalLoggerConfig.
   * Captures log entries into the internal array.
   *
   * @param {LogEntry} entry - The log entry to capture
   * @returns {void}
   */
  sink(entry: LogEntry): void {
    this.entries.push(entry);
  }

  /**
   * Clear all captured entries
   *
   * @returns {void}
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get entries filtered by log level
   *
   * @param {number} level - The log level to filter by (LogLevel.ERROR, LogLevel.INFO, etc.)
   * @returns {LogEntry[]} Array of log entries matching the specified level
   */
  getByLevel(level: number): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  /**
   * Get entries filtered by namespace
   *
   * @param {string} namespace - The namespace to filter by (e.g., "aa-infra", "wallet-apis")
   * @returns {LogEntry[]} Array of log entries matching the specified namespace
   */
  getByNamespace(namespace: string): LogEntry[] {
    return this.entries.filter((e) => e.namespace === namespace);
  }

  /**
   * Get entries filtered by message substring
   *
   * @param {string} substring - The substring to search for in log messages
   * @returns {LogEntry[]} Array of log entries containing the substring in their message
   */
  getByMessage(substring: string): LogEntry[] {
    return this.entries.filter((e) => e.message.includes(substring));
  }

  /**
   * Get the most recent log entry
   *
   * @returns {LogEntry | undefined} The latest log entry, or undefined if no entries have been captured
   */
  latest(): LogEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  /**
   * Get the number of captured entries
   *
   * @returns {number} The total count of captured log entries
   */
  get count(): number {
    return this.entries.length;
  }
}
