import { BaseError as CoreBaseError } from "@aa-sdk/core";
import type { Chain } from "viem";
import { VERSION } from "./version.js";

export abstract class BaseError extends CoreBaseError {
  // This version could be different from the aa-core version so we overwrite this here.
  override version = VERSION;
}

export class ClientOnlyPropertyError extends BaseError {
  name: string = "ClientOnlyPropertyError";

  constructor(property: string) {
    super(`${property} is only available on the client`);
  }
}

export class ChainNotFoundError extends BaseError {
  name: string = "ChainNotFoundError";

  constructor(chain: Chain) {
    super(`Chain (${chain.name}) not found in connections config object`, {
      docsPath: "https://accountkit.alchemy.com/react/createConfig",
    });
  }
}
