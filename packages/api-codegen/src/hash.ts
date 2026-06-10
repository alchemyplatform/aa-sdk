import { createHash } from "node:crypto";

/**
 * Computes the sha256 hex digest of a string, used to pin spec snapshots in
 * specs.lock.json and verify them at generate time.
 *
 * @param {string} content The content to hash
 * @returns {string} The sha256 hex digest
 */
export function sha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
