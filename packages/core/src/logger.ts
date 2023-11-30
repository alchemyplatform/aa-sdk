export enum LogLevel {
  VERBOSE = 5,
  DEBUG = 4,
  INFO = 3,
  WARN = 2,
  ERROR = 1,
  NONE = 0,
}

export class Logger {
  static logLevel: LogLevel = LogLevel.INFO;
  static logFilter?: string;

  static setLogLevel(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  static setLogFilter(pattern: string) {
    this.logFilter = pattern;
  }

  static error(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.ERROR)) return;

    console.error(msg, ...args);
  }

  static warn(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.WARN)) return;

    console.warn(msg, ...args);
  }

  static debug(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.DEBUG)) return;

    console.debug(msg, ...args);
  }

  static info(msg: string, ...args: any[]) {
    if (!this.shouldLog(msg, LogLevel.INFO)) return;

    console.info(msg, ...args);
  }

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
