import { BaseError } from "@alchemy/common";
import type { Permission } from "../ma-v2/permissionBuilder";
import type { Address } from "viem";

/**
 * Abstract class representing a Permission Builder Error, subclassed by all permission builder errors.
 */
export abstract class PermissionBuilderError extends BaseError {}

/**
 * Error class for when a root permission is added to a permission builder.
 */
export class RootPermissionOnlyError extends PermissionBuilderError {
  override name = "PermissionBuilder: RootPermissionOnlyError";

  /**
   * Constructor for initializing an error message indicating that the root permission cannot be combined with other permissions.
   *
   * @param {Permission} permission The permission trying to be added atop the root permission
   */
  constructor(permission: Permission) {
    super(
      `Adding ${permission.type}: Cannot add permissions with ROOT permission`,
    );
  }
}

/**
 * Error class for when an account address is used as target.
 */
export class AccountAddressAsTargetError extends PermissionBuilderError {
  override name = "PermissionBuilder: AccountAddressAsTargetError";

  /**
   * Constructor for initializing an error message indicating that account address is used as target.
   *
   * @param {Permission} permission The permission with account address as target
   */
  constructor(permission: Permission) {
    super(
      `${permission.type}: Account address as target, use ACCOUNT_FUNCTIONS for account address`,
    );
  }
}

/**
 * Error class for when a duplicate target address is added to a permission builder.
 */
export class DuplicateTargetAddressError extends PermissionBuilderError {
  override name = "PermissionBuilder: DuplicateTargetAddressError";

  /**
   * Constructor for initializing an error message indicating duplicate target address in permissions.
   *
   * @param {Permission} permission The permission with duplicate target address
   * @param {Address} targetAddress The duplicate target address
   */
  constructor(permission: Permission, targetAddress: Address) {
    super(
      `${permission.type}: Address ${targetAddress} already has a permission. Cannot add multiple CONTRACT_ACCESS or FUNCTIONS_ON_CONTRACT permissions for the same target address.`,
    );
  }
}

/**
 * Error class for when no functions are provided to a permission builder.
 */
export class NoFunctionsProvidedError extends PermissionBuilderError {
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

/**
 * Error class for when a deadline is expired.
 */
export class ExpiredDeadlineError extends PermissionBuilderError {
  override name = "PermissionBuilder: ExpiredDeadlineError";

  /**
   * Constructor for initializing an error message indicating the deadline has expired.
   *
   * @param {number} deadline The expired deadline timestamp
   * @param {number} currentTime The current timestamp
   */
  constructor(deadline: number, currentTime: number) {
    super(
      `compileDeferred(): deadline ${deadline} cannot be before now (${currentTime})`,
    );
  }
}

/**
 * Error class for when a deadline is over the limit.
 */
export class DeadlineOverLimitError extends PermissionBuilderError {
  override name = "PermissionBuilder: DeadlineOverLimitError";

  /**
   * Constructor for initializing an error message indicating the deadline has expired.
   *
   * @param {number} deadline The expired deadline timestamp
   */
  constructor(deadline: number) {
    super(
      `compileDeferred(): deadline ${deadline} cannot be > max uint48 (2^48 - 1)`,
    );
  }
}

/**
 * Error class for when a validation config is unset.
 */
export class ValidationConfigUnsetError extends PermissionBuilderError {
  override name = "PermissionBuilder: ValidationConfigUnsetError";

  /**
   * Constructor for initializing an error message indicating the validation config is unset.
   */
  constructor() {
    super(
      "Missing permission among: functions on contract, functions on all contracts, account functions, contract access, or erc20 token transfer",
    );
  }
}

/**
 * Error class for when a multiple native token transfer permission is added to a permission builder.
 */
export class MultipleNativeTokenTransferError extends PermissionBuilderError {
  override name = "PermissionBuilder: MultipleNativeTokenTransferError";

  /**
   * Constructor for initializing an error message indicating multiple native token transfer permissions.
   *
   * @param {Permission} permission The duplicate native token transfer permission
   */
  constructor(permission: Permission) {
    super(
      `${permission.type}: Must have at most ONE native token transfer permission`,
    );
  }
}

/**
 * Error class for when a zero address is provided to a permission builder.
 */
export class ZeroAddressError extends PermissionBuilderError {
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

/**
 * Error class for when a multiple gas limit permission is added to a permission builder.
 */
export class MultipleGasLimitError extends PermissionBuilderError {
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

/**
 * Error class for when an unsupported permission type is added to a permission builder.
 */
export class UnsupportedPermissionTypeError extends PermissionBuilderError {
  override name = "PermissionBuilder: UnsupportedPermissionTypeError";

  /**
   * Constructor for initializing an error message indicating an unsupported permission type.
   */
  constructor() {
    super(`Unsupported permission type`);
  }
}

/**
 * Error class for when a selector is not allowed.
 */
export class SelectorNotAllowed extends PermissionBuilderError {
  override name = "SelectorNotAllowed";

  /**
   * Constructor for initializing an error message indicating that the selector being added is not allowed.
   *
   * @param {string} functionName The function name of the selector that is being added.
   */
  constructor(functionName: string) {
    super(`Cannot add ${functionName} on the account`);
  }
}
