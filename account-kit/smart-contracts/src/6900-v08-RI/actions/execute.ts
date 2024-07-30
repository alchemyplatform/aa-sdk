import type { SmartContractAccount } from "@aa-sdk/core";
import { encodeFunctionData } from "viem";
import { UpgradeableModularAccountAbi } from "../abis/UpgradeableModularAccount.js";

export const executor: Pick<
  SmartContractAccount,
  "encodeExecute" | "encodeBatchExecute"
> = {
  encodeExecute: async ({ target, data, value }) => {
    return encodeFunctionData({
      abi: UpgradeableModularAccountAbi,
      functionName: "execute",
      args: [target, value ?? 0n, data],
    });
  },
  encodeBatchExecute: async (txs) => {
    return encodeFunctionData({
      abi: UpgradeableModularAccountAbi,
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
