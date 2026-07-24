import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Writes a file only if its content actually changed, creating parent
 * directories as needed. Keeps git status and build caches quiet when
 * regeneration produces identical output.
 *
 * @param {string} filePath Absolute path to write
 * @param {string} content File content
 * @returns {boolean} true if the file was written, false if it was already up to date
 */
export function writeIfChanged(filePath: string, content: string): boolean {
  if (existsSync(filePath) && readFileSync(filePath, "utf8") === content) {
    return false;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
  return true;
}
