import ora from "ora";
import pc from "picocolors";
import { format as utilFormat } from "util";

function format(args: any[]) {
  return utilFormat(...args)
    .split("\n")
    .join("\n");
}

/**
 * Log a success message
 *
 * @param args the message
 */
export function success(...args: any[]) {
  console.log(pc.green(format(args)));
}

/**
 * Log an info message
 *
 * @param args the info message
 */
export function info(...args: any[]) {
  console.info(pc.blue(format(args)));
}

/**
 * Log a message
 *
 * @param args the message
 */
export function log(...args: any[]) {
  console.log(pc.white(format(args)));
}

/**
 *  Log a warning message
 *
 * @param args the warn message
 */
export function warn(...args: any[]) {
  console.warn(pc.yellow(format(args)));
}

/**
 * Log an error message
 *
 * @param args the error message
 */
export function error(...args: any[]) {
  console.error(pc.red(format(args)));
}

/**
 * Create a spinner for logging
 *
 * @returns a spinner
 */
export function spinner() {
  return ora({
    color: "yellow",
    spinner: "dots",
  });
}
