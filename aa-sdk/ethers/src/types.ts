import {
  type BundlerClient,
  type SmartAccountClient,
  type SmartContractAccount,
} from "@aa-sdk/core";
import type { Chain, Transport } from "viem";

export type EthersProviderAdapterOpts<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  account?: TAccount;
} & (
  | {
      rpcProvider: string | BundlerClient<TTransport>;
      chain: Chain;
    }
  | {
      accountProvider: SmartAccountClient<TTransport, TChain, TAccount>;
    }
);
