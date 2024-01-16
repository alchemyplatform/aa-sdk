import type { Address, BatchUserOperationCallData } from "@alchemy/aa-core";
import { encodeFunctionData, type Hex } from "viem";
import type { Executor } from "../../builder/types";
import { SessionKeyPluginAbi } from "./plugin.js";

export const SessionKeyExecutor: Executor = (acct) => {
  const owner = acct.getOwner();
  if (!owner) {
    throw new Error("Account must be connected to an owner");
  }

  return {
    async encodeExecute(
      target: Address,
      value: bigint,
      data: Hex
    ): Promise<`0x${string}`> {
      return encodeFunctionData({
        abi: SessionKeyPluginAbi,
        functionName: "executeWithSessionKey",
        args: [[{ target, value, data }], await owner.getAddress()],
      });
    },

    async encodeBatchExecute(
      txs: BatchUserOperationCallData
    ): Promise<`0x${string}`> {
      return encodeFunctionData({
        abi: SessionKeyPluginAbi,
        functionName: "executeWithSessionKey",
        args: [
          txs.map((tx) => ({
            target: tx.target,
            data: tx.data,
            value: tx.value ?? 0n,
          })),
          await owner.getAddress(),
        ],
      });
    },
  };
};
