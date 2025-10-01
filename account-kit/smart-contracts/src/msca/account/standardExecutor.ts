import type { SmartContractAccount } from "@aa-sdk/core";
import { encodeFunctionData } from "viem";
import { IStandardExecutorAbi } from "../abis/IStandardExecutor.js";

export const standardExecutor: Pick<
  SmartContractAccount,
  "encodeExecute" | "encodeBatchExecute"
> = {
  encodeExecute: async ({ target, data, value }) => {
    return encodeFunctionData({
      abi: IStandardExecutorAbi,
      functionName: "execute",
      args: [target, value ?? 0n, data],
    });
  },
  encodeBatchExecute: async (txs) => {
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
};
