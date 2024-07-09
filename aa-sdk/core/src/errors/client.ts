import type { Client } from "viem";
import { BaseError } from "./base.js";

/**
 * Represents an error thrown when a client is not compatible with the expected client type for a specific method. The error message provides guidance on how to create a compatible client.
 */
export class IncompatibleClientError extends BaseError {
  override name = "IncompatibleClientError";

  /**
   * Throws an error when the client type does not match the expected client type.
   *
   * @param {string} expectedClient The expected type of the client.
   * @param {string} method The method that was called.
   * @param {Client} client The client instance.
   */
  constructor(expectedClient: string, method: string, client: Client) {
    super(
      [
        `Client of type (${client.type}) is not a ${expectedClient}.`,
        `Create one with \`createSmartAccountClient\` first before using \`${method}\``,
      ].join("\n")
    );
  }
}

/**
 * Represents an error that occurs when an invalid RPC URL is provided. This class extends the `BaseError` class and includes the invalid URL in the error message.
 */
export class InvalidRpcUrlError extends BaseError {
  override name = "InvalidRpcUrlError";

  /**
   * Creates an instance of an error with a message indicating an invalid RPC URL.
   *
   * @param {string} [rpcUrl] The invalid RPC URL that caused the error
   */
  constructor(rpcUrl?: string) {
    super(`Invalid RPC URL ${rpcUrl}`);
  }
}

/**
 * Error class representing a "Chain Not Found" error, typically thrown when no chain is supplied to the client.
 */
export class ChainNotFoundError extends BaseError {
  override name = "ChainNotFoundError";

  /**
   * Initializes a new instance of the error message with a default message indicating that no chain was supplied to the client.
   */
  constructor() {
    super("No chain supplied to the client");
  }
}
