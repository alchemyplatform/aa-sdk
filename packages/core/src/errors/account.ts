import type { Chain } from "viem";
import type { EntryPointVersion } from "../entrypoint/types.js";
import { BaseError } from "./base.js";

export class AccountNotFoundError extends BaseError {
  override name = "AccountNotFoundError";

  // TODO: extend this further using docs path as well
  constructor() {
    super("Could not find an Account to execute with this Action.");
  }
}

export class DefaultFactoryNotDefinedError extends BaseError {
  override name = "DefaultFactoryNotDefinedError";
  constructor(accountType: string, chain: Chain, version: EntryPointVersion) {
    super(
      [
        `No default factory for ${accountType} found on chain ${chain.name} for entrypoint version ${version}`,
        "Supply an override via the `factoryAddress` parameter when creating an account",
      ].join("\n")
    );
  }
}

export class GetCounterFactualAddressError extends BaseError {
  override name = "GetCounterFactualAddressError";
  constructor() {
    super("getCounterFactualAddress failed");
  }
}

export class UpgradesNotSupportedError extends BaseError {
  override name = "UpgradesNotSupported";
  constructor(accountType: string) {
    super(`Upgrades are not supported by ${accountType}`);
  }
}

export class SignTransactionNotSupportedError extends BaseError {
  override name = "SignTransactionNotSupported";
  constructor() {
    super(`SignTransaction is not supported by smart contracts`);
  }
}

export class FailedToGetStorageSlotError extends BaseError {
  override name = "FailedToGetStorageSlotError";
  constructor(slot: string, slotDescriptor: string) {
    super(`Failed to get storage slot ${slot} (${slotDescriptor})`);
  }
}

export class BatchExecutionNotSupportedError extends BaseError {
  override name = "BatchExecutionNotSupportedError";
  constructor(accountType: string) {
    super(`Batch execution is not supported by ${accountType}`);
  }
}

export class AccountRequiresOwnerError extends BaseError {
  override name = "AccountRequiresOwnerError";
  constructor(accountType: string) {
    super(`Account of type ${accountType} requires an owner to execute`);
  }
}

export class UpgradeToAndCallNotSupportedError extends BaseError {
  override name = "UpgradeToAndCallNotSupportedError";
  constructor(accountType: string) {
    super(`UpgradeToAndCall is not supported by ${accountType}`);
  }
}

export class IncorrectAccountType extends BaseError {
  override name = "IncorrectAccountTypeError";
  constructor(expected: string, actual: string) {
    super(`Expected account type ${expected}, got ${actual}`);
  }
}

export class SmartAccountWithSignerRequiredError extends BaseError {
  override name = "SmartAccountWithSignerRequiredError";
  constructor() {
    super("Smart account requires a signer");
  }
}
