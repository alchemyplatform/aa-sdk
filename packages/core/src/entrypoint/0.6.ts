import type { Address, Chain } from "viem";
import type { UserOperationRequest } from "../types";
import {
  getDefaultEntryPointAddress,
  getUserOperationHash,
  packUo,
} from "../utils/index.js";
import type { EntryPointDef } from "./types";

export const getVersion060EntryPoint: (
  chain: Chain,
  address?: Address
) => EntryPointDef<UserOperationRequest> = (
  chain: Chain,
  address = getDefaultEntryPointAddress(chain)
) => {
  return {
    version: "0.6.0",
    address,
    chain,
    packUserOperation: (userOperation: UserOperationRequest) => {
      return packUo(userOperation);
    },
    getUserOperationHash: (userOperation: UserOperationRequest) => {
      return getUserOperationHash(userOperation, address, chain.id);
    },
  } satisfies EntryPointDef<UserOperationRequest>;
};
