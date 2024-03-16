import type {
  Abi,
  Account,
  Address,
  Chain,
  GetContractParameters,
  Hex,
  Transport,
} from "viem";
import type { UserOperationRequest } from "../types";

export type EntryPointDef<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
  TAbi extends Abi | readonly unknown[] = Abi
> = {
  version: TEntryPointVersion;
  address: Address;
  abi: GetContractParameters<Transport, Chain, Account, TAbi>["abi"];
  chain: Chain;
  packUserOperation: (
    userOperation: UserOperationRequest<TEntryPointVersion>
  ) => Hex;
  getUserOperationHash: (
    userOperation: UserOperationRequest<TEntryPointVersion>
  ) => Hex;
};

export type EntryPointVersion = "0.6.0" | "0.7.0" | DefaultEntryPointVersion;

export type DefaultEntryPointVersion = "0.6.0";
