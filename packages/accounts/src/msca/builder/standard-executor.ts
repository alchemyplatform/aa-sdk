import type { BatchUserOperationCallData } from "@alchemy/aa-core";
import { encodeFunctionData, type Address, type Hex } from "viem";
import { IStandardExecutorAbi } from "../abis/IStandardExecutor.js";
import type { Executor } from "./types";

export const StandardExecutor: Executor = () => ({
  async encodeExecute(
    target: Address,
    value: bigint,
    data: Hex
  ): Promise<`0x${string}`> {
    return encodeFunctionData({
      abi: IStandardExecutorAbi,
      functionName: "execute",
      args: [target, value, data],
    });
  },

  async encodeBatchExecute(
    txs: BatchUserOperationCallData
  ): Promise<`0x${string}`> {
    return encodeFunctionData({
      abi: IStandardExecutorAbi,
      functionName: "executeBatch",
      args: [
        txs.map((tx) => ({
          target: tx.target,
          data: tx.data,
          value: tx.value ?? 0n,
        })),
      ],
    });
  },
});
