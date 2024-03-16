import type { Chain } from "viem";
import type { EntryPointVersion } from "../entrypoint/types.js";
import { BaseError } from "./base.js";

export class EntryPointNotFoundError<
  TEntryPointVersion extends EntryPointVersion | undefined = EntryPointVersion
> extends BaseError {
  override name = "EntryPointNotFoundError";

  constructor(chain: Chain, entryPointVersion: TEntryPointVersion) {
    super(
      [
        `No default entry point v${entryPointVersion} exists for ${chain.name}.`,
        `Supply an override.`,
      ].join("\n")
    );
  }
}
