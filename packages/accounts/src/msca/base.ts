import {
  BaseSmartContractAccount,
  SignerSchema,
  createBaseSmartAccountParamsSchema,
  type BatchUserOperationCallData,
  type SupportedTransports,
} from "@alchemy/aa-core";
import {
  encodeFunctionData,
  type Address,
  type FallbackTransport,
  type Hex,
  type Transport,
} from "viem";
import { z } from "zod";
import { IStandardExecutorAbi } from "./abis/IStandardExecutor.js";

export const createModularSmartContractAccountSchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  createBaseSmartAccountParamsSchema<TTransport>().extend({
    owner: SignerSchema,
  });

export type ModularSmartContractAccountParams = z.input<
  ReturnType<typeof createModularSmartContractAccountSchema>
>;

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
}
