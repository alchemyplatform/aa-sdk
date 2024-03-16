import type { Address, Chain } from "viem";
import { EntryPointAbi_v6 } from "../abis/EntryPointAbi_v6.js";
import { EntryPointAbi_v7 } from "../abis/EntryPointAbi_v7.js";
import type { UserOperationRequest } from "../types";
import {
  getDefaultEntryPointAddress,
  getUserOperationHash,
  packUserOperation,
} from "../utils/index.js";
import type { EntryPointDef, EntryPointVersion } from "./types.js";

export const getEntryPoint = <
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
>(
  chain: Chain,
  version: TEntryPointVersion,
  address: Address = getDefaultEntryPointAddress<TEntryPointVersion>(
    chain,
    version
  )
): EntryPointDef<TEntryPointVersion> => {
  return {
    version,
    address,
    chain,
    abi: version === "0.6.0" ? EntryPointAbi_v6 : EntryPointAbi_v7,
    packUserOperation: (
      userOperation: UserOperationRequest<TEntryPointVersion>
    ) => {
      return packUserOperation<TEntryPointVersion>(userOperation);
    },
    getUserOperationHash: (
      userOperation: UserOperationRequest<TEntryPointVersion>
    ) => {
      return getUserOperationHash<TEntryPointVersion>(
        userOperation,
        address,
        chain.id
      );
    },
  } satisfies EntryPointDef<TEntryPointVersion>;
};
