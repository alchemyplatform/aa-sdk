import {
  BaseSmartContractAccount,
  type BatchUserOperationCallData,
} from "@alchemy/aa-core";
import {
  encodeFunctionData,
  type Address,
  type FallbackTransport,
  type Hex,
  type Transport,
} from "viem";
import { IStandardExecutorAbi } from "./abis/IStandardExecutor.js";
import type { Plugin } from "./plugins/types.js";

export abstract class BaseModularSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartContractAccount<TTransport> {
  async encodeExecute(target: Address, value: bigint, data: Hex): Promise<Hex> {
    return encodeFunctionData({
      abi: IStandardExecutorAbi,
      functionName: "execute",
      args: [
        {
          target,
          data,
          value,
        },
      ],
    });
  }

  async encodeBatchExecute(txs: BatchUserOperationCallData): Promise<Hex> {
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
  }

  extendWithPluginMethods = <D>(plugin: Plugin<D>): this & D => {
    const methods = plugin.decorators;
    return Object.assign(this, methods);
  };
}
