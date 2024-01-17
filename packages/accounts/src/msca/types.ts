import type {
  ISmartAccountProvider,
  ISmartContractAccount,
  SmartAccountSigner,
  SupportedTransports,
} from "@alchemy/aa-core";
import type { Abi, Transport } from "viem";
import type { Plugin } from "./plugins/types";

export interface IMSCA<
  TTransport extends SupportedTransports = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TProviderDecorators = {}
> extends ISmartContractAccount<Transport, TOwner> {
  providerDecorators: (
    p: ISmartAccountProvider<TTransport>
  ) => TProviderDecorators;

  extendWithPluginMethods: <AD, PD, TAbi extends Abi>(
    plugin: Plugin<AD, PD, TAbi>
  ) => this & IMSCA<TTransport, TOwner, TProviderDecorators & PD> & AD;
}
