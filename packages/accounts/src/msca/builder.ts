import {
  BaseSmartContractAccount,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
  type ISmartAccountProvider,
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
import { pluginManagerDecorator } from "./plugin-manager/decorator.js";
import type { Plugin } from "./plugins/types";

export interface IMSCA<
  TTransport extends SupportedTransports = Transport,
  TProviderDecorators = {}
> extends ISmartContractAccount {
  providerDecorators: (
    p: ISmartAccountProvider<TTransport>
  ) => TProviderDecorators;

  extendWithPluginMethods: <AD, PD>(
    plugin: Plugin<AD, PD>
  ) => IMSCA<TTransport, TProviderDecorators & PD> & AD;

  addProviderDecorator: <
    PD,
    TProvider extends ISmartAccountProvider<TTransport> & { account: IMSCA }
  >(
    decorator: (p: TProvider) => PD
  ) => IMSCA<TTransport, TProviderDecorators & PD>;
}

export type Executor = <A extends IMSCA<any, any>>(
  acct: A
) => Pick<ISmartContractAccount, "encodeExecute" | "encodeBatchExecute">;

export type SignerMethods = <A extends IMSCA<any, any>>(
  acct: A
) => Pick<
  ISmartContractAccount,
  | "signMessage"
  | "signTypedData"
  | "signUserOperationHash"
  | "getDummySignature"
>;

export type Factory = <A extends IMSCA<any, any>>(acct: A) => Promise<Hex>;

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
  ): IMSCA<TTransport, ReturnType<typeof pluginManagerDecorator>> {
    const builder = this;
    const { signer, executor, factory } = zCompleteBuilder.parse(builder);

    return new (class DynamicMSCA<
      TProviderDecorators = ReturnType<typeof pluginManagerDecorator>
    > extends BaseSmartContractAccount<TTransport> {
      providerDecorators_: (<
        TProvider extends ISmartAccountProvider<TTransport> & { account: IMSCA }
      >(
        p: TProvider
      ) => any)[] = [pluginManagerDecorator];

      providerDecorators: (
        p: ISmartAccountProvider<TTransport>
      ) => TProviderDecorators = (p) => {
        if (!p.isConnected() && p.account !== this) {
          throw new Error(
            "provider should be connected if it is being decorated by the account"
          );
        }

        return this.providerDecorators_.reduce(
          (acc, decorator) => ({
            ...acc,
            ...decorator(
              p as ISmartAccountProvider<TTransport> & { account: IMSCA }
            ),
          }),
          {} as TProviderDecorators
        );
      };

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

      extendWithPluginMethods = <AD, PD>(
        plugin: Plugin<AD, PD>
      ): DynamicMSCA<TProviderDecorators & PD> & AD => {
        const methods = plugin.accountDecorators(this);
        const result = Object.assign(this, methods) as unknown as DynamicMSCA<
          TProviderDecorators & PD
        > &
          AD;
        result.providerDecorators_.push(plugin.providerDecorators);

        return result as unknown as DynamicMSCA<TProviderDecorators & PD> & AD;
      };

      addProviderDecorator = <
        PD,
        TProvider extends ISmartAccountProvider<TTransport> & { account: IMSCA }
      >(
        decorator: (p: TProvider) => PD
      ): DynamicMSCA<TProviderDecorators & PD> => {
        // @ts-expect-error this will be an error, but it's fine because we cast below
        this.providerDecorators_.push(decorator);

        return this as unknown as DynamicMSCA<TProviderDecorators & PD>;
      };
    })(params);
  }
}
