export enum LogLevel {
  VERBOSE = 5,
  DEBUG = 4,
  INFO = 3,
  WARN = 2,
  ERROR = 1,
  NONE = 0,
}

/**
 * Logger class provides static methods for logging at different levels such as error, warn, debug, info, and verbose. This class allows setting log levels and log filters to control the logging behavior.
 */
export class Logger {
  static logLevel: LogLevel = LogLevel.INFO;
  static logFilter?: string;

  /**
   * Sets the log level for logging purposes.
   *
   * @example
   * ```ts
   * import { Logger, LogLevel } from "@aa-sdk/core";
   * Logger.setLogLevel(LogLevel.DEBUG);
   * ```
   *
   * @param {LogLevel} logLevel The desired log level
   */
  static setLogLevel(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  /**
   * Sets the log filter pattern.
   *
   * @example
   * ```ts
   * import { Logger } from "@aa-sdk/core";
   *
   * Logger.setLogFilter("error");
   * ```
   *
   * @param {string} pattern The pattern to set as the log filter
   */
  static setLogFilter(pattern: string) {
    this.logFilter = pattern;
  }

  /**
   * Logs an error message to the console if the logging condition is met.
   *
   * @example
   * ```ts
   * import { Logger } from "@aa-sdk/core";
   *
   * Logger.error("An error occurred while processing the request");
   * ```
   *
   * @param {string} msg The primary error message to be logged
   * @param {...any[]} args Additional arguments to be logged along with the error message
   */
  static error(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.ERROR)) return;

    console.error(msg, ...args);
  }

  /**
   * Logs a warning message if the logging conditions are met.
   *
   * @example
   * ```ts
   * import { Logger } from "@aa-sdk/core";
   *
   * Logger.warn("Careful...");
   * ```
   *
   * @param {string} msg The message to log as a warning
   * @param {...any[]} args Additional parameters to log along with the message
   */
  static warn(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.WARN)) return;

    console.warn(msg, ...args);
  }

  /**
   * Logs a debug message to the console if the log level allows it.
   *
   * @example
   * ```ts
   * import { Logger } from "@aa-sdk/core";
   *
   * Logger.debug("Something is happening");
   * ```
   *
   * @param {string} msg The message to log
   * @param {...any[]} args Additional arguments to pass to the console.debug method
   */
  static debug(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.DEBUG)) return;

    console.debug(msg, ...args);
  }

  /**
   * Logs an informational message to the console if the logging level is set to INFO.
   *
   * @example
   * ```ts
   * import { Logger } from "@aa-sdk/core";
   *
   * Logger.info("Something is happening");
   * ```
   *
   * @param {string} msg the message to log
   * @param {...any[]} args additional arguments to log alongside the message
   */
  static info(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.INFO)) return;

    console.info(msg, ...args);
  }

  /**
   * Logs a message with additional arguments if the logging level permits it.
   *
   * @example
   * ```ts
   * import { Logger } from "@aa-sdk/core";
   *
   * Logger.verbose("Something is happening");
   * ```
   *
   * @param {string} msg The message to log
   * @param {...any[]} args Additional arguments to be logged
   */
  static verbose(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.VERBOSE)) return;

    console.log(msg, ...args);
  }

  private static shouldLog(msg: string, level: LogLevel) {
    if (this.logLevel < level) return false;
    if (this.logFilter && !msg.includes(this.logFilter)) return false;

    return true;
  }
}
