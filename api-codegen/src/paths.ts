import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path of the api-codegen package directory. */
export const PACKAGE_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

/** Absolute path of the aa-sdk repo root. */
export const REPO_ROOT = resolve(PACKAGE_DIR, "..");

/** Absolute path of the committed spec snapshots directory. */
export const SPECS_DIR = resolve(PACKAGE_DIR, "specs");

/** Absolute path of the snapshot lockfile. */
export const LOCKFILE_PATH = resolve(SPECS_DIR, "specs.lock.json");
