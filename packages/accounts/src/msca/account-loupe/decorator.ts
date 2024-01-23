import type { Hash } from "viem";
import { IAccountLoupeAbi } from "../abis/IAccountLoupe.js";
import type { IMSCA } from "../types.js";
import type { FunctionReference, IAccountLoupe } from "./types.js";

export const accountLoupeDecorators = (
  account: IMSCA<any, any, any>
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
