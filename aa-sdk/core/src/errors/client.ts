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

/**
 * Error class denoting that the provided entity id is invalid because it's too large.
 */
export class InvalidEntityIdError extends BaseError {
  override name = "InvalidEntityIdError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the entity id is invalid because it's too large.
   *
   * @param {number} entityId the invalid entityId used
   */
  constructor(entityId: number) {
    super(
      `Entity ID used is ${entityId}, but must be less than or equal to uint32.max`
    );
  }
}

/**
 * Error class denoting that the nonce key is invalid because its too large.
 */
export class InvalidNonceKeyError extends BaseError {
  override name = "InvalidNonceKeyError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the nonce key is invalid.
   *
   * @param {bigint} nonceKey the invalid nonceKey used
   */
  constructor(nonceKey: bigint) {
    super(
      `Nonce key is ${nonceKey} but has to be less than or equal to 2**152`
    );
  }
}

/**
 * Error class denoting that the provided entity id is invalid because it's overriding the native entity id.
 */
export class EntityIdOverrideError extends BaseError {
  override name = "EntityIdOverrideError";

  /**
   * Initializes a new instance of the error message with a default message indicating that the nonce key is invalid.
   */
  constructor() {
    super(`EntityId of 0 is reserved for the owner and cannot be used`);
  }
}

/**
 * Error class denoting that the provided ma v2 account mode is invalid.
 */
export class InvalidModularAccountV2Mode extends BaseError {
  override name = "InvalidModularAccountV2Mode";

  /**
   * Initializes a new instance of the error message with a default message indicating that the provided ma v2 account mode is invalid.
   */
  constructor() {
    super(`The provided account mode is invalid for ModularAccount V2`);
  }
}

/**
 * Error class denoting that the deferred action mode used is invalid.
 */
export class InvalidDeferredActionMode extends BaseError {
  override name = "InvalidDeferredActionMode";

  /**
   * Initializes a new instance of the error message with a default message indicating that the provided ma v2 account mode is invalid.
   */
  constructor() {
    super(`The provided deferred action mode is invalid`);
  }
}

/**
 * Error class denoting that the deferred action nonce used is invalid.
 */
export class InvalidDeferredActionNonce extends BaseError {
  override name = "InvalidDeferredActionNonce";

  /**
   * Initializes a new instance of the error message with a default message indicating that the provided ma v2 account mode is invalid.
   */
  constructor() {
    super(`The provided deferred action nonce is invalid`);
  }
}
