import { encodeFunctionData, type Address, type Hex } from "viem";
import { SessionKeyPermissionsUpdatesAbi } from "./SessionKeyPermissionsUpdatesAbi.js";

export enum SessionKeyAccessListType {
  ALLOWLIST = 0,
  DENYLIST = 1,
  ALLOW_ALL_ACCESS = 2,
}

export type ContractAccessEntry = {
  // The contract address to add or remove.
  contractAddress: Address;
  // Whether the contract address should be on the list.
  isOnList: boolean;
  // Whether to check selectors for the contract address.
  checkSelectors: boolean;
};

export type ContractMethodEntry = {
  // The contract address to add or remove.
  contractAddress: Address;
  // The function selector to add or remove.
  methodSelector: Hex;
  // Whether the function selector should be on the list.
  isOnList: boolean;
};

export type TimeRange = {
  validFrom: number;
  validUntil: number;
};

export type NativeTokenLimit = {
  spendLimit: bigint;
  // The time interval over which the spend limit is enforced. If unset, there is no time
  /// interval by which the limit is refreshed.
  refreshInterval?: number;
};

export type Erc20TokenLimit = {
  tokenAddress: Address;
  spendLimit: bigint;
  // The time interval over which the spend limit is enforced. If unset, there is no time
  /// interval by which the limit is refreshed.
  refreshInterval?: number;
};

// uint256 spendLimit, uint48 refreshInterval
export type GasSpendLimit = {
  // The amount, in wei, of native tokens that a session key can spend on gas.
  // Note that this is not the same as the gas limit for a user operation, which is measured in units of gas.
  // This tracks gas units * gas price.
  spendLimit: bigint;
  // The time interval over which the spend limit is enforced. If unset, there is no time
  /// interval by which the limit is refreshed.
  refreshInterval?: number;
};

/**
 * A builder for creating the hex-encoded data for updating session key permissions.
 */
export class SessionKeyPermissionsBuilder {
  private _contractAccessControlType: SessionKeyAccessListType =
    SessionKeyAccessListType.ALLOWLIST;
  private _contractAddressAccessEntrys: ContractAccessEntry[] = [];
  private _contractMethodAccessEntrys: ContractMethodEntry[] = [];
  private _timeRange?: TimeRange;
  private _nativeTokenSpendLimit?: NativeTokenLimit;
  private _erc20TokenSpendLimits: Erc20TokenLimit[] = [];
  private _gasSpendLimit?: GasSpendLimit;
  private _requiredPaymaster?: Address;

  /**
   * Sets the access control type for the contract and returns the current instance for method chaining.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.setContractAccessControlType(SessionKeyAccessListType.ALLOWLIST);
   * ```
   *
   * @param {SessionKeyAccessListType} aclType The access control type for the session key
   * @returns {SessionKeyPermissionsBuilder} The current instance for method chaining
   */
  public setContractAccessControlType(aclType: SessionKeyAccessListType) {
    this._contractAccessControlType = aclType;
    return this;
  }

  /**
   * Adds a contract access entry to the internal list of contract address access entries.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.addContractAddressAccessEntry({
   *  contractAddress: "0x1234",
   *  isOnList: true,
   *  checkSelectors: true,
   * });
   * ```
   *
   * @param {ContractAccessEntry} entry the contract access entry to be added
   * @returns {SessionKeyPermissionsBuilder} the instance of the current class for chaining
   */
  public addContractAddressAccessEntry(entry: ContractAccessEntry) {
    this._contractAddressAccessEntrys.push(entry);
    return this;
  }

  /**
   * Adds a contract method entry to the `_contractMethodAccessEntrys` array.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.addContractAddressAccessEntry({
   *  contractAddress: "0x1234",
   *  methodSelector: "0x45678",
   *  isOnList: true,
   * });
   * ```
   *
   * @param {ContractMethodEntry} entry The contract method entry to be added
   * @returns {SessionKeyPermissionsBuilder} The instance of the class for method chaining
   */
  public addContractFunctionAccessEntry(entry: ContractMethodEntry) {
    this._contractMethodAccessEntrys.push(entry);
    return this;
  }

  /**
   * Sets the time range for an object and returns the object itself for chaining.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.setTimeRange({
   *  validFrom: Date.now(),
   *  validUntil: Date.now() + (15 * 60 * 1000),
   * });
   * ```
   *
   * @param {TimeRange} timeRange The time range to be set
   * @returns {SessionKeyPermissionsBuilder} The current object for method chaining
   */
  public setTimeRange(timeRange: TimeRange) {
    this._timeRange = timeRange;
    return this;
  }

  /**
   * Sets the native token spend limit and returns the instance for chaining.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.setNativeTokenSpendLimit({
   *  spendLimit: 1000000000000000000n,
   *  refreshInterval: 3600,
   * });
   * ```
   *
   * @param {NativeTokenLimit} limit The limit to set for native token spending
   * @returns {SessionKeyPermissionsBuilder} The instance for chaining
   */
  public setNativeTokenSpendLimit(limit: NativeTokenLimit) {
    this._nativeTokenSpendLimit = limit;
    return this;
  }

  /**
   * Adds an ERC20 token spend limit to the list of limits and returns the updated object.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.addErc20TokenSpendLimit({
   *  tokenAddress: "0x1234",
   *  spendLimit: 1000000000000000000n,
   *  refreshInterval: 3600,
   * });
   * ```
   *
   * @param {Erc20TokenLimit} limit The ERC20 token spend limit to be added
   * @returns {object} The updated object with the new ERC20 token spend limit
   */
  public addErc20TokenSpendLimit(limit: Erc20TokenLimit) {
    this._erc20TokenSpendLimits.push(limit);
    return this;
  }

  /**
   * Sets the gas spend limit and returns the current instance for method chaining.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.setGasSpendLimit({
   *  spendLimit: 1000000000000000000n,
   *  refreshInterval: 3600,
   * });
   * ```
   *
   * @param {GasSpendLimit} limit - The gas spend limit to be set
   * @returns {SessionKeyPermissionsBuilder} The current instance for chaining
   */ public setGasSpendLimit(limit: GasSpendLimit) {
    this._gasSpendLimit = limit;
    return this;
  }

  /**
   * Sets the required paymaster address.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.setRequiredPaymaster("0x1234");
   * ```
   *
   * @param {Address} paymaster the address of the paymaster to be set
   * @returns {SessionKeyPermissionsBuilder} the current instance for method chaining
   */
  public setRequiredPaymaster(paymaster: Address) {
    this._requiredPaymaster = paymaster;
    return this;
  }

  /**
   * Encodes various function calls into an array of hexadecimal strings based on the provided permissions and limits.
   *
   * @example
   * ```ts
   * import { SessionKeyPermissionsBuilder } from "@account-kit/smart-contracts";
   *
   * const builder = new SessionKeyPermissionsBuilder();
   * builder.setRequiredPaymaster("0x1234");
   * const encoded = builder.encode();
   * ```
   *
   * @returns {Hex[]} An array of encoded hexadecimal strings representing the function calls for setting access control, permissions, and limits.
   */
  public encode(): Hex[] {
    return [
      encodeFunctionData({
        abi: SessionKeyPermissionsUpdatesAbi,
        functionName: "setAccessListType",
        args: [this._contractAccessControlType],
      }),
      ...this._contractAddressAccessEntrys.map((entry) =>
        encodeFunctionData({
          abi: SessionKeyPermissionsUpdatesAbi,
          functionName: "updateAccessListAddressEntry",
          args: [entry.contractAddress, entry.isOnList, entry.checkSelectors],
        }),
      ),
      ...this._contractMethodAccessEntrys.map((entry) =>
        encodeFunctionData({
          abi: SessionKeyPermissionsUpdatesAbi,
          functionName: "updateAccessListFunctionEntry",
          args: [entry.contractAddress, entry.methodSelector, entry.isOnList],
        }),
      ),
      this.encodeIfDefined(
        (timeRange) =>
          encodeFunctionData({
            abi: SessionKeyPermissionsUpdatesAbi,
            functionName: "updateTimeRange",
            args: [timeRange.validFrom, timeRange.validUntil],
          }),
        this._timeRange,
      ),
      this.encodeIfDefined(
        (nativeSpendLimit) =>
          encodeFunctionData({
            abi: SessionKeyPermissionsUpdatesAbi,
            functionName: "setNativeTokenSpendLimit",
            args: [
              nativeSpendLimit.spendLimit,
              nativeSpendLimit.refreshInterval ?? 0,
            ],
          }),
        this._nativeTokenSpendLimit,
      ),
      ...this._erc20TokenSpendLimits.map((erc20SpendLimit) =>
        encodeFunctionData({
          abi: SessionKeyPermissionsUpdatesAbi,
          functionName: "setERC20SpendLimit",
          args: [
            erc20SpendLimit.tokenAddress,
            erc20SpendLimit.spendLimit,
            erc20SpendLimit.refreshInterval ?? 0,
          ],
        }),
      ),
      this.encodeIfDefined(
        (spendLimit) =>
          encodeFunctionData({
            abi: SessionKeyPermissionsUpdatesAbi,
            functionName: "setGasSpendLimit",
            args: [spendLimit.spendLimit, spendLimit.refreshInterval ?? 0],
          }),
        this._gasSpendLimit,
      ),
      this.encodeIfDefined(
        (paymaster) =>
          encodeFunctionData({
            abi: SessionKeyPermissionsUpdatesAbi,
            functionName: "setRequiredPaymaster",
            args: [paymaster],
          }),
        this._requiredPaymaster,
      ),
    ].filter((x) => x !== "0x");
  }

  private encodeIfDefined<T>(encode: (param: T) => Hex, param?: T): Hex {
    if (!param) return "0x";

    return encode(param);
  }
}
