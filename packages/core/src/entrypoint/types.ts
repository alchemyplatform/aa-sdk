import type { Address, Chain, Hex } from "viem";

export type EntryPointDef<EntryPointUserOperation> = {
  version: string;
  address: Address;
  chain: Chain;
  packUserOperation: (userOperation: EntryPointUserOperation) => Hex;
  getUserOperationHash: (userOperation: EntryPointUserOperation) => Hex;
};
