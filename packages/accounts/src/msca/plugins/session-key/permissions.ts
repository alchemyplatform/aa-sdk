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

  public setContractAccessControlType(aclType: SessionKeyAccessListType) {
    this._contractAccessControlType = aclType;
    return this;
  }

  public addContractAddressAccessEntry(entry: ContractAccessEntry) {
    this._contractAddressAccessEntrys.push(entry);
    return this;
  }

  public addContractFunctionAccessEntry(entry: ContractMethodEntry) {
    this._contractMethodAccessEntrys.push(entry);
    return this;
  }

  public setTimeRange(timeRange: TimeRange) {
    this._timeRange = timeRange;
    return this;
  }

  public setNativeTokenSpendLimit(limit: NativeTokenLimit) {
    this._nativeTokenSpendLimit = limit;
    return this;
  }

  public addErc20TokenSpendLimit(limit: Erc20TokenLimit) {
    this._erc20TokenSpendLimits.push(limit);
    return this;
  }

  public setGasSpendLimit(limit: GasSpendLimit) {
    this._gasSpendLimit = limit;
    return this;
  }

  public setRequiredPaymaster(paymaster: Address) {
    this._requiredPaymaster = paymaster;
    return this;
  }

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
        })
      ),
      ...this._contractMethodAccessEntrys.map((entry) =>
        encodeFunctionData({
          abi: SessionKeyPermissionsUpdatesAbi,
          functionName: "updateAccessListFunctionEntry",
          args: [entry.contractAddress, entry.methodSelector, entry.isOnList],
        })
      ),
      this.encodeIfDefined(
        (timeRange) =>
          encodeFunctionData({
            abi: SessionKeyPermissionsUpdatesAbi,
            functionName: "updateTimeRange",
            args: [timeRange.validFrom, timeRange.validUntil],
          }),
        this._timeRange
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
        this._nativeTokenSpendLimit
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
        })
      ),
      this.encodeIfDefined(
        (spendLimit) =>
          encodeFunctionData({
            abi: SessionKeyPermissionsUpdatesAbi,
            functionName: "setGasSpendLimit",
            args: [spendLimit.spendLimit, spendLimit.refreshInterval ?? 0],
          }),
        this._gasSpendLimit
      ),
      this.encodeIfDefined(
        (paymaster) =>
          encodeFunctionData({
            abi: SessionKeyPermissionsUpdatesAbi,
            functionName: "setRequiredPaymaster",
            args: [paymaster],
          }),
        this._requiredPaymaster
      ),
    ].filter((x) => x !== "0x");
  }

  private encodeIfDefined<T>(encode: (param: T) => Hex, param?: T): Hex {
    if (!param) return "0x";

    return encode(param);
  }
}
