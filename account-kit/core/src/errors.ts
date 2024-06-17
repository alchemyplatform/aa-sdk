import { BaseError as CoreBaseError } from "@alchemy/aa-core";
import type { Chain } from "viem";
import { VERSION } from "./version.js";

export abstract class BaseError extends CoreBaseError {
  // This version could be different from the aa-core version so we overwrite this here.
  override version = VERSION;
}

/**
 * Error thrown when attempting to access a client-only property on the server.
 *
 * @param property the name of the property that is client-only
 */
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
