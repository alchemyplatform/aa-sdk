import type {
  ISmartAccountProvider,
  ISmartContractAccount,
  SupportedTransports,
} from "@alchemy/aa-core";
import type { Abi, Transport } from "viem";
import type { Plugin } from "./plugins/types";

export interface IMSCA<
  TTransport extends SupportedTransports = Transport,
  TProviderDecorators = {}
> extends ISmartContractAccount {
  providerDecorators: (
    p: ISmartAccountProvider<TTransport>
  ) => TProviderDecorators;

  extendWithPluginMethods: <AD, PD, TAbi extends Abi>(
    plugin: Plugin<AD, PD, TAbi>
  ) => this & IMSCA<TTransport, TProviderDecorators & PD> & AD;
}
