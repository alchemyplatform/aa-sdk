import { BaseError as CoreBaseError } from "@aa-sdk/core";
import type { Chain } from "viem";
import { VERSION } from "./version.js";

/**
 * Represents the base class for custom errors, inheriting from `CoreBaseError` and overriding the version with a specific version number.
 */
export abstract class BaseError extends CoreBaseError {
  // This version could be different from the aa-core version so we overwrite this here.
  override version = VERSION;
}

/**
 * Error thrown when a client only property is accessed on the server
 */
export class ClientOnlyPropertyError extends BaseError {
  name: string = "ClientOnlyPropertyError";

  /**
   * Creates a new ClientOnlyPropertyError
   *
   * @param {string} property the name of the property that is only available on the client
   */
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
