import type { Chain } from "viem";
import type { EntryPointVersion } from "../entrypoint/types.js";
import { BaseError } from "./base.js";

/**
 * This error is thrown when an account could not be found to execute a specific action. It extends the `BaseError` class.
 */
export class AccountNotFoundError extends BaseError {
  override name = "AccountNotFoundError";

  // TODO: extend this further using docs path as well

  /**
   * Constructor for initializing an error message indicating that an account could not be found to execute the specified action.
   */ constructor() {
    super("Could not find an Account to execute with this Action.");
  }
}

/**
 * Represents an error that is thrown when no default factory is defined for a specific account type on a given chain and entry point version.
 * This error suggests providing an override via the `factoryAddress` parameter when creating an account.
 */
export class DefaultFactoryNotDefinedError extends BaseError {
  override name = "DefaultFactoryNotDefinedError";

  /**
   * Constructs an error message indicating that no default factory was found for the given account type, chain, and entry point version.
   *
   * @param {string} accountType the type of account
   * @param {Chain} chain the blockchain chain
   * @param {EntryPointVersion} version the entry point version
   */
  constructor(accountType: string, chain: Chain, version: EntryPointVersion) {
    super(
      [
        `No default factory for ${accountType} found on chain ${chain.name} for entrypoint version ${version}`,
        "Supply an override via the `factoryAddress` parameter when creating an account",
      ].join("\n"),
    );
  }
}

/**
 * Custom error class for handling errors when getting a counterfactual address. This extends the `BaseError` class and provides a custom error message and name.
 */
export class GetCounterFactualAddressError extends BaseError {
  override name = "GetCounterFactualAddressError";

  /**
   * Constructor for initializing an error message indicating the failure of fetching the counter-factual address.
   */ constructor() {
    super("getCounterFactualAddress failed");
  }
}

/**
 * An error class representing the condition where upgrades are not supported for a specific account type. This error extends the `BaseError` class and provides a custom error message based on the account type.
 */
export class UpgradesNotSupportedError extends BaseError {
  override name = "UpgradesNotSupported";

  /**
   * Error constructor for indicating that upgrades are not supported by the given account type.
   *
   * @param {string} accountType The type of account that does not support upgrades
   */
  constructor(accountType: string) {
    super(`Upgrades are not supported by ${accountType}`);
  }
}

/**
 * Error thrown when attempting to sign a transaction that is not supported by smart contracts.
 */
export class SignTransactionNotSupportedError extends BaseError {
  override name = "SignTransactionNotSupported";

  /**
   * Throws an error indicating that signing a transaction is not supported by smart contracts.
   *
   
   */ constructor() {
    super(`SignTransaction is not supported by smart contracts`);
  }
}

/**
 * Custom error class `FailedToGetStorageSlotError` which is used to signal a failure when attempting to retrieve a storage slot. This error includes the slot and slot descriptor in its message and inherits from `BaseError`.
 */
export class FailedToGetStorageSlotError extends BaseError {
  override name = "FailedToGetStorageSlotError";

  /**
   * Custom error message constructor for failing to get a specific storage slot.
   *
   * @param {string} slot The storage slot that failed to be accessed or retrieved
   * @param {string} slotDescriptor A description of the storage slot, for additional context in the error message
   */
  constructor(slot: string, slotDescriptor: string) {
    super(`Failed to get storage slot ${slot} (${slotDescriptor})`);
  }
}

/**
 * Represents an error indicating that batch execution is not supported for a specific account type.
 */
export class BatchExecutionNotSupportedError extends BaseError {
  override name = "BatchExecutionNotSupportedError";

  /**
   * Constructs an error message indicating that batch execution is not supported by the specified account type.
   *
   * @param {string} accountType the type of account that does not support batch execution
   */
  constructor(accountType: string) {
    super(`Batch execution is not supported by ${accountType}`);
  }
}

/**
 * Represents an error that occurs when an account requires an owner to execute but none is provided.
 */
export class AccountRequiresOwnerError extends BaseError {
  override name = "AccountRequiresOwnerError";

  /**
   * Constructs an error indicating that an account of the specified type requires an owner to execute.
   *
   * @param {string} accountType The type of account that requires an owner
   */
  constructor(accountType: string) {
    super(`Account of type ${accountType} requires an owner to execute`);
  }
}

/**
 * Represents an error that occurs when an attempt is made to call `UpgradeToAndCall` on an account type that does not support it. Includes the account type in the error message.
 */
export class UpgradeToAndCallNotSupportedError extends BaseError {
  override name = "UpgradeToAndCallNotSupportedError";

  /**
   * Constructs an error message indicating that `UpgradeToAndCall` is not supported by the specified account type.
   *
   * @param {string} accountType The type of account that does not support `UpgradeToAndCall`
   */
  constructor(accountType: string) {
    super(`UpgradeToAndCall is not supported by ${accountType}`);
  }
}

/**
 * Represents an error thrown when an account type does not match the expected type.
 */
export class IncorrectAccountType extends BaseError {
  override name = "IncorrectAccountTypeError";

  /**
   * Constructs an error object indicating that the expected account type does not match the actual account type.
   *
   * @param {string} expected the expected account type
   * @param {string} actual the actual account type that was received
   */
  constructor(expected: string, actual: string) {
    super(`Expected account type ${expected}, got ${actual}`);
  }
}

/**
 * Error class indicating that a smart account operation requires a signer.
 */
export class SmartAccountWithSignerRequiredError extends BaseError {
  override name = "SmartAccountWithSignerRequiredError";

  /**
   * Initializes a new instance of the error class with a predefined error message indicating that a smart account requires a signer.
   */ constructor() {
    super("Smart account requires a signer");
  }
}
