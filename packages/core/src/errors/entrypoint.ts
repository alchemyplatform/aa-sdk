import type { Chain } from "viem";
import { BaseError } from "./base.js";

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

export class InvalidEntryPointError extends BaseError {
  override name = "InvalidEntryPointError";

  constructor(chain: Chain, entryPointVersion: any) {
    super(
      `Invalid entry point: unexpected version ${entryPointVersion} for ${chain.name}.`
    );
  }
}
