import fs from "fs-extra";
import * as logger from "./logger.js";

const LOCK_FILE_SUFFIX = ".lock";
const LOCK_RETRY_INTERVAL = 100; // 100ms
export const MAX_LOCK_WAIT_TIME = 30000; // 30 seconds

export async function acquireLock(filePath: string): Promise<boolean> {
  const lockPath = filePath + LOCK_FILE_SUFFIX;
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_LOCK_WAIT_TIME) {
    try {
      // Try to create lock file exclusively (fails if it already exists)
      await fs.writeFile(lockPath, process.pid.toString(), { flag: "wx" });
      return true;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ) {
        // Lock exists, check if the process is still running
        try {
          const lockPid = await fs.readFile(lockPath, "utf-8");
          try {
            // Check if process is still running
            process.kill(parseInt(lockPid), 0);
            // Process is running, wait and retry
            await new Promise((resolve) =>
              setTimeout(resolve, LOCK_RETRY_INTERVAL),
            );
            continue;
          } catch {
            // Process is not running, remove stale lock
            await fs.remove(lockPath);
            continue;
          }
        } catch {
          // Can't read lock file, remove it and retry
          await fs.remove(lockPath);
          continue;
        }
      } else {
        // Other error, can't acquire lock
        return false;
      }
    }
  }
  return false;
}

export async function releaseLock(filePath: string): Promise<void> {
  const lockPath = filePath + LOCK_FILE_SUFFIX;
  try {
    await fs.remove(lockPath);
  } catch {
    logger.error(`Failed to release lock for ${filePath}`);
  }
}
