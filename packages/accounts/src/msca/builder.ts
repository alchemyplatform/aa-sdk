import {
  BaseSmartContractAccount,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
  type ISmartContractAccount,
  type SignTypedDataParams,
  type SupportedTransports,
} from "@alchemy/aa-core";
import {
  encodeFunctionData,
  type Address,
  type Hex,
  type Transport,
} from "viem";
import { z } from "zod";
import { IStandardExecutorAbi } from "./abis/IStandardExecutor.js";
import type { Plugin } from "./plugins/types";

export interface MSCA extends ISmartContractAccount {
  extendWithPluginMethods: <D>(plugin: Plugin<D>) => this & D;
}

export type Executor = <A extends MSCA>(
  acct: A
) => Pick<ISmartContractAccount, "encodeExecute" | "encodeBatchExecute">;

export type SignerMethods = <A extends MSCA>(
  acct: A
) => Pick<
  ISmartContractAccount,
  | "signMessage"
  | "signTypedData"
  | "signUserOperationHash"
  | "getDummySignature"
>;

export type Factory = <A extends MSCA>(acct: A) => Promise<Hex>;

// TODO: this can be moved out into its own file
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

const zCompleteBuilder = z.object({
  executor: z.custom<Executor>(),
  signer: z.custom<SignerMethods>(),
  factory: z.custom<Factory>(),
});

export class MSCABuilder {
  executor?: Executor;
  signer?: SignerMethods;
  factory?: Factory;

  withExecutor(executor: Executor): this & { executor: Executor } {
    return Object.assign(this, { executor });
  }

  withSigner(methods: SignerMethods): this & { signer: SignerMethods } {
    return Object.assign(this, { signer: methods });
  }

  withFactory(initCode: Factory): this & { factory: Factory } {
    return Object.assign(this, { factory: initCode });
  }

  build<TTransport extends SupportedTransports = Transport>(
    params: BaseSmartAccountParams
  ): MSCA {
    const builder = this;
    const { signer, executor, factory } = zCompleteBuilder.parse(builder);

    return new (class extends BaseSmartContractAccount<TTransport> {
      getDummySignature(): `0x${string}` {
        return signer(this).getDummySignature();
      }

      encodeExecute(
        target: string,
        value: bigint,
        data: string
      ): Promise<`0x${string}`> {
        return executor(this).encodeExecute(target, value, data);
      }

      encodeBatchExecute(
        txs: BatchUserOperationCallData
      ): Promise<`0x${string}`> {
        return executor(this).encodeBatchExecute(txs);
      }

      signMessage(msg: string | Uint8Array): Promise<`0x${string}`> {
        return signer(this).signMessage(msg);
      }

      signTypedData(params: SignTypedDataParams): Promise<`0x${string}`> {
        return signer(this).signTypedData(params);
      }

      signUserOperationHash(uoHash: `0x${string}`): Promise<`0x${string}`> {
        return signer(this).signUserOperationHash(uoHash);
      }

      protected getAccountInitCode(): Promise<`0x${string}`> {
        return factory(this);
      }

      extendWithPluginMethods = <D>(plugin: Plugin<D>): this & D => {
        const methods = plugin.accountDecorators(this);
        return Object.assign(this, methods);
      };
    })(params);
  }
}
