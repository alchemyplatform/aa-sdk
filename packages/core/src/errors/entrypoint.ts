import type { Chain } from "viem";
import { BaseError } from "./base.js";

export class EntryPointNotFoundError extends BaseError {
  override name = "EntrypointNotFoundError";

  constructor(chain: Chain) {
    super(
      [
        `No default entry point exists for ${chain.name}.`,
        `Supply an override.`,
      ].join("\n"),
    );
  }
}
