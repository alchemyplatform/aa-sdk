import type { Address } from "@alchemy/aa-core";
import type { Hash } from "viem";
import { IAccountLoupeAbi } from "../abis/IAccountLoupe.js";
import type { IMSCA } from "../builder.js";
import type { FunctionReference, IAccountLoupe } from "./types.js";

export const accountLoupeDecorators = (
  account: IMSCA<any, any>
): IAccountLoupe => ({
  getExecutionFunctionConfig: async (selector: FunctionReference) =>
    account.rpcProvider.readContract({
      address: await account.getAddress(),
      abi: IAccountLoupeAbi,
      functionName: "getExecutionFunctionConfig",
      args: [selector],
    }),

  getExecutionHooks: async (selector: FunctionReference) =>
    account.rpcProvider.readContract({
      address: await account.getAddress(),
      abi: IAccountLoupeAbi,
      functionName: "getExecutionHooks",
      args: [selector],
    }),

  getPermittedCallHooks: async (callingPlugin: Address, selector: Hash) =>
    account.rpcProvider.readContract({
      address: await account.getAddress(),
      abi: IAccountLoupeAbi,
      functionName: "getPermittedCallHooks",
      args: [callingPlugin, selector],
    }),

  getPreValidationHooks: async (selector: Hash) =>
    account.rpcProvider.readContract({
      address: await account.getAddress(),
      abi: IAccountLoupeAbi,
      functionName: "getPreValidationHooks",
      args: [selector],
    }),

  getInstalledPlugins: async () =>
    account.rpcProvider.readContract({
      address: await account.getAddress(),
      abi: IAccountLoupeAbi,
      functionName: "getInstalledPlugins",
    }),
});
