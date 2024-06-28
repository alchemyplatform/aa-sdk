import type { Chain } from "viem";
import { BaseError } from "./base.js";

/**
 * Represents an error thrown when an entry point is not found for a specific chain and entry point version. This error indicates that a default entry point does not exist for the given chain and version, and suggests providing an override.
 */
export class EntryPointNotFoundError extends BaseError {
  override name = "EntryPointNotFoundError";

  constructor(chain: Chain, entryPointVersion: any) {
    super(
      [
        `No default entry point v${entryPointVersion} exists for ${chain.name}.`,
        `Supply an override.`,
      ].join("\n")
    );
  }
}

/**
 * Represents an error thrown when an invalid entry point version is encountered for a specific chain. This error extends the `BaseError` class.
 */
export class InvalidEntryPointError extends BaseError {
  override name = "InvalidEntryPointError";

  constructor(chain: Chain, entryPointVersion: any) {
    super(
      `Invalid entry point: unexpected version ${entryPointVersion} for ${chain.name}.`
    );
  }
}
