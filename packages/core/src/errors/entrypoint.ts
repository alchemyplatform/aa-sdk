import type { Chain } from "viem";
import { BaseError } from "./base.js";

export class EntrypointNotFoundError extends BaseError {
  override name = "EntrypointNotFoundError";

  constructor(chain: Chain) {
    super(
      [
        `No default entrypoint exists for ${chain.name}.`,
        `Supply an override.`,
      ].join("\n")
    );
  }
}
