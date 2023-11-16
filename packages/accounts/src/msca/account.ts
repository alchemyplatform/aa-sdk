import {
  BaseSmartContractAccount,
  SignerSchema,
  createBaseSmartAccountParamsSchema,
  type BatchUserOperationCallData,
  type SignTypedDataParams,
  type SmartAccountSigner,
  type SupportedTransports,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  type Address,
  type FallbackTransport,
  type Hex,
  type Transport,
} from "viem";
import { z } from "zod";
import { IStandardExecutorAbi } from "./abis/IStandardExecutor.js";
import { MultiOwnerMSCAFactoryAbi } from "./abis/MultiOwnerMSCAFactory.js";
import type { Plugin } from "./plugins/types.js";

export const createModularSmartContractAccountSchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  createBaseSmartAccountParamsSchema<TTransport>().extend({
    owner: SignerSchema,
    index: z.bigint().optional().default(0n),
  });

export type ModularSmartContractAccountParams = z.input<
  ReturnType<typeof createModularSmartContractAccountSchema>
>;

export class ModularSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartContractAccount<TTransport> {
  protected owner: SmartAccountSigner;
  protected index: bigint;

  constructor(params_: ModularSmartContractAccountParams) {
    const params =
      createModularSmartContractAccountSchema<TTransport>().parse(params_);

    super(params);

    this.owner = params.owner;
    this.index = params.index;
  }

  getDummySignature(): Hex {
    // NOTE: this only works for ECDSA based validators
    return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
  }

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

  signMessage(msg: string | Uint8Array): Promise<Hex> {
    return this.owner.signMessage(msg);
  }

  signTypedData(params: SignTypedDataParams): Promise<Hex> {
    return this.owner.signTypedData(params);
  }

  protected async getAccountInitCode(): Promise<`0x${string}`> {
    // TODO: this needs to be configured differently later because it assumes everything uses this factory (which is not the case)
    return concatHex([
      this.factoryAddress,
      encodeFunctionData({
        abi: MultiOwnerMSCAFactoryAbi,
        functionName: "createAccount",
        // TODO: this needs to support creating accounts with multiple owners
        args: [this.index, [await this.owner.getAddress()]],
      }),
    ]);
  }

  extendWithPluginMethods = <D>(plugin: Plugin<D>): this & D => {
    const methods = plugin.decorators;

    return Object.assign(this, methods);
  };
}
