import { BaseError, type Address } from "@aa-sdk/core";
import type { Permission } from "./permissionBuilder";

export class RootPermissionOnlyError extends BaseError {
  override name = "PermissionBuilder: RootPermissionOnlyError";

  /**
   * Constructor for initializing an error message indicating that an account could not be found to execute the specified action.
   *
   * @param {Permission} permission The permission trying to be added atop the root permission
   */
  constructor(permission: Permission) {
    super(`Adding ${permission}: Cannot add permissions with ROOT permission`);
  }
}

export class AccountAddressAsTargetError extends BaseError {
  override name = "PermissionBuilder: AccountAddressAsTargetError";

  /**
   * Constructor for initializing an error message indicating that account address is used as target.
   *
   * @param {Permission} permission The permission with account address as target
   */
  constructor(permission: Permission) {
    super(
      `${permission.type}: Account address as target, use ACCOUNT_FUNCTIONS for account address`
    );
  }
}

export class DuplicateTargetAddressError extends BaseError {
  override name = "PermissionBuilder: DuplicateTargetAddressError";

  /**
   * Constructor for initializing an error message indicating duplicate target address in permissions.
   *
   * @param {Permission} permission The permission with duplicate target address
   * @param {Address} targetAddress The duplicate target address
   */
  constructor(permission: Permission, targetAddress: Address) {
    super(
      `${permission.type}: Address ${targetAddress} already has a permission. Cannot add multiple CONTRACT_ACCESS or FUNCTIONS_ON_CONTRACT permissions for the same target address.`
    );
  }
}

export class NoFunctionsProvidedError extends BaseError {
  override name = "PermissionBuilder: NoFunctionsProvidedError";

  /**
   * Constructor for initializing an error message indicating no functions were provided.
   *
   * @param {Permission} permission The permission missing functions
   */
  constructor(permission: Permission) {
    super(`${permission.type}: No functions provided`);
  }
}

export class ExpiredDeadlineError extends BaseError {
  override name = "PermissionBuilder: ExpiredDeadlineError";

  /**
   * Constructor for initializing an error message indicating the deadline has expired.
   *
   * @param {number} deadline The expired deadline timestamp
   * @param {number} currentTime The current timestamp
   */
  constructor(deadline: number, currentTime: number) {
    super(
      `compileDeferred(): deadline ${deadline} cannot be before now (${currentTime})`
    );
  }
}

export class ValidationConfigUnsetError extends BaseError {
  override name = "PermissionBuilder: ValidationConfigUnsetError";

  /**
   * Constructor for initializing an error message indicating the validation config is unset.
   */
  constructor() {
    super("Validation config unset, use permissionBuilder.configure(...)");
  }
}

export class MultipleNativeTokenTransferError extends BaseError {
  override name = "PermissionBuilder: MultipleNativeTokenTransferError";

  /**
   * Constructor for initializing an error message indicating multiple native token transfer permissions.
   *
   * @param {Permission} permission The duplicate native token transfer permission
   */
  constructor(permission: Permission) {
    super(
      `${permission.type}: Must have at most ONE native token transfer permission`
    );
  }
}

export class ZeroAddressError extends BaseError {
  override name = "PermissionBuilder: ZeroAddressError";

  /**
   * Constructor for initializing an error message indicating zero address was provided.
   *
   * @param {Permission} permission The permission with zero address
   */
  constructor(permission: Permission) {
    super(`${permission.type}: Zero address provided`);
  }
}

export class MultipleGasLimitError extends BaseError {
  override name = "PermissionBuilder: MultipleGasLimitError";

  /**
   * Constructor for initializing an error message indicating multiple gas limit permissions.
   *
   * @param {Permission} permission The duplicate gas limit permission
   */
  constructor(permission: Permission) {
    super(`${permission.type}: Must have at most ONE gas limit permission`);
  }
}

export class UnsupportedPermissionTypeError extends BaseError {
  override name = "PermissionBuilder: UnsupportedPermissionTypeError";

  /**
   * Constructor for initializing an error message indicating an unsupported permission type.
   *
   * @param {string} type The unsupported permission type
   */
  constructor(type: string) {
    super(`Unsupported permission type: ${type}`);
  }
}
