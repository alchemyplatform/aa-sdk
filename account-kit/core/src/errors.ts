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

/**
 * Error thrown when a client does not have a chain configured in the connections object
 * This is not really meant to be used out of the SDK, but is exported for convenience (ie. matching errors are of an instance of this class)
 */
export class ChainNotFoundError extends BaseError {
  name: string = "ChainNotFoundError";

  /**
   * Constructs a new error indicating that the specified chain was not found in the connections configuration object.
   *
   * @example
   * ```ts
   * import { ChainNotFoundError } from "@account-kit/core";
   * import { sepolia } from "@account-kit/infra";
   *
   * throw new ChainNotFoundError(sepolia);
   * ```
   *
   * @param {Chain} chain The chain for which the error is being thrown
   */
  constructor(chain: Chain) {
    super(`Chain (${chain.name}) not found in connections config object`, {
      docsPath: "/reference/account-kit/react/functions/createConfig",
    });
  }
}

export class SignerNotConnectedError extends BaseError {
  name: string = "SignerNotConnectedError";

  constructor() {
    super(
      "Signer not connected. Authenticate the user before calling this function",
    );
  }
}
