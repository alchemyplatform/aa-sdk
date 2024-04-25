import type { Chain } from "viem";
import type { EntryPointVersion } from "../entrypoint/types.js";
import { BaseError } from "./base.js";

/**
 * Error thrown when an account is not found
 */
export class AccountNotFoundError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "AccountNotFoundError";

  /**
   * Creates an instance of AccountNotFoundError
   */
  constructor() {
    super("Could not find an Account to execute with this Action.");
  }
}

/**
 * Error thrown when the default factory for the account is not defined
 */
export class DefaultFactoryNotDefinedError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "DefaultFactoryNotDefinedError";
  /**
   * Creates an instance of DefaultFactoryNotDefinedError
   *
   * @param accountType the account type
   * @param chain the chain
   * @param version the entrypoint version
   */
  constructor(accountType: string, chain: Chain, version: EntryPointVersion) {
    super(
      [
        `No default factory for ${accountType} found on chain ${chain.name} for entrypoint version ${version}`,
        "Supply an override via the `factoryAddress` parameter when creating an account",
      ].join("\n")
    );
  }
}

/**
 * Error thrown when failed to get the counterfactual address of the account
 */
export class GetCounterFactualAddressError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "GetCounterFactualAddressError";
  /**
   * Creates an instance of GetCounterFactualAddressError
   *
   */
  constructor() {
    super("getCounterFactualAddress failed");
  }
}

/**
 * Error thrown when the account does not support upgrades
 */
export class UpgradesNotSupportedError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "UpgradesNotSupported";
  /**
   * Creates an instance of UpgradesNotSupportedError.
   *
   * @param accountType the account type
   */
  constructor(accountType: string) {
    super(`Upgrades are not supported by ${accountType}`);
  }
}

/**
 * Error thrown when signing transaction is not supported by the account
 */
export class SignTransactionNotSupportedError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "SignTransactionNotSupported";
  /**
   * Creates an instance of SignTransactionNotSupportedError.
   *
   */
  constructor() {
    super(`SignTransaction is not supported by smart contracts`);
  }
}

/**
 * Error thrown when failed to get the storage slot of the account
 */
export class FailedToGetStorageSlotError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "FailedToGetStorageSlotError";
  /**
   * Creates an instance of FailedToGetStorageSlotError
   *
   * @param slot the storage slot
   * @param slotDescriptor the storage slot descriptor
   */
  constructor(slot: string, slotDescriptor: string) {
    super(`Failed to get storage slot ${slot} (${slotDescriptor})`);
  }
}

/**
 * Error thrown when the account does not support batch execution
 */
export class BatchExecutionNotSupportedError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "BatchExecutionNotSupportedError";
  /**
   * Creates an instance of BatchExecutionNotSupportedError.
   *
   * @param accountType the account type
   */
  constructor(accountType: string) {
    super(`Batch execution is not supported by ${accountType}`);
  }
}

/**
 * Error thrown when the account requires but lacks the owner
 */
export class AccountRequiresOwnerError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "AccountRequiresOwnerError";
  /**
   * Creates an instance of AccountRequiresOwnerError.
   *
   * @param accountType the account type
   */
  constructor(accountType: string) {
    super(`Account of type ${accountType} requires an owner to execute`);
  }
}

/**
 * Error thrown when the account does not support `upgradeToAndCall`
 */
export class UpgradeToAndCallNotSupportedError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "UpgradeToAndCallNotSupportedError";
  /**
   * Creates an instance of UpgradeToAndCallNotSupportedError.
   *
   * @param accountType the account type
   */
  constructor(accountType: string) {
    super(`UpgradeToAndCall is not supported by ${accountType}`);
  }
}

/**
 * Error thrown when the account type is incorrect
 */
export class IncorrectAccountType extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "IncorrectAccountTypeError";
  /**
   * Creates an instance of IncorrectAccountType.
   *
   * @param expected expected the account type
   * @param actual actual the account type
   */
  constructor(expected: string, actual: string) {
    super(`Expected the account type ${expected}, got ${actual}`);
  }
}

/**
 * Error thrown when the account with the signer is required but the account lacks the signer
 */
export class SmartAccountWithSignerRequiredError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "SmartAccountWithSignerRequiredError";
  /**
   * Creates an instance of SmartAccountWithSignerRequiredError.
   *
   */
  constructor() {
    super("Smart account requires a signer");
  }
}
