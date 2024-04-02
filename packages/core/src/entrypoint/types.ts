import type {
  Abi,
  Account,
  Address,
  Chain,
  GetContractParameters,
  Hash,
  Hex,
  Transport,
} from "viem";
import type { EntryPointAbi_v6 } from "../abis/EntryPointAbi_v6";
import type { EntryPointAbi_v7 } from "../abis/EntryPointAbi_v7";
import type {
  UserOperationLike,
  UserOperationOverrides,
  UserOperationRequest,
} from "../types";
import type { EQ, OneOf } from "../utils";

export interface EntryPointRegistryBase<T> {
  "0.6.0": T;
  "0.7.0": T;
}
export type EntryPointVersion = keyof EntryPointRegistryBase<unknown>;
export type DefaultEntryPointVersion = OneOf<"0.6.0", EntryPointVersion>;

export type SupportedEntryPoint<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi
> = {
  version: TEntryPointVersion;
  address: Record<TChain["id"], Address>;
  abi: GetContractParameters<Transport, TChain, Account, TAbi>["abi"];

  /**
   * Generates a hash for a UserOperation valid from entry point version 0.6 onwards
   *
   * @param request - the UserOperation to get the hash for
   * @param entryPointAddress - the entry point address that will be used to execute the UserOperation
   * @param chainId - the chain on which this UserOperation will be executed
   * @returns the hash of the UserOperation
   */
  getUserOperationHash: (
    request: UserOperationRequest<TEntryPointVersion>,
    entryPointAddress: Address,
    chainId: number
  ) => Hash;

  /**
   * Pack the user operation data into bytes for hashing for entry point version 0.6 onwards
   * Reference:
   * v6: https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.6/test/UserOp.ts#L16-L61
   * v7: https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/test/UserOp.ts#L28-L67
   *
   * @param request - the UserOperation to get the hash for
   * @returns the hash of the UserOperation
   */
  packUserOperation: (
    userOperation: UserOperationRequest<TEntryPointVersion>
  ) => Hex;

  isUserOpVersion: (
    userOperation: UserOperationLike
  ) => userOperation is UserOperationRequest<TEntryPointVersion>;
};

export interface EntryPointRegistry<TChain extends Chain = Chain>
  extends EntryPointRegistryBase<
    SupportedEntryPoint<EntryPointVersion, TChain, Abi>
  > {
  "0.6.0": SupportedEntryPoint<"0.6.0", TChain, typeof EntryPointAbi_v6>;
  "0.7.0": SupportedEntryPoint<"0.7.0", TChain, typeof EntryPointAbi_v7>;
}

export type EntryPointDef<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain = Chain,
  TAbi extends Abi | readonly unknown[] = Abi
> = {
  version: TEntryPointVersion;
  address: Address;
  chain: TChain;
  overrides: UserOperationOverrides<TEntryPointVersion> | undefined;
  abi: GetContractParameters<Transport, TChain, Account, TAbi>["abi"];
  getUserOperationHash: (
    request: UserOperationRequest<TEntryPointVersion>
  ) => Hex;
  packUserOperation: (
    userOperation: UserOperationRequest<TEntryPointVersion>
  ) => Hex;
  isUserOpVersion: (
    userOperation: UserOperationLike
  ) => userOperation is UserOperationRequest<TEntryPointVersion>;
  coerce: (
    userOperation: UserOperationLike,
    throwable?: boolean
  ) => UserOperationLike<TEntryPointVersion> | undefined;
};

export interface EntryPointDefRegistry<TChain extends Chain = Chain>
  extends EntryPointRegistryBase<
    EntryPointDef<EntryPointVersion, TChain, Abi>
  > {
  "0.6.0": EntryPointDef<"0.6.0", TChain, typeof EntryPointAbi_v6>;
  "0.7.0": EntryPointDef<"0.7.0", TChain, typeof EntryPointAbi_v7>;
}

export type GetEntryPointOptions<
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
> = EQ<TEntryPointVersion, DefaultEntryPointVersion> extends true
  ?
      | {
          addressOverride?: Address;
          version?: OneOf<TEntryPointVersion, EntryPointVersion>;
        }
      | undefined
  : {
      addressOverride?: Address;
      version: OneOf<TEntryPointVersion, EntryPointVersion>;
    };

export type EntryPointParameter<
  TEntryPointVersion extends EntryPointVersion,
  TChain extends Chain = Chain
> = {
  entryPoint?: EntryPointDef<TEntryPointVersion, TChain>;
};
