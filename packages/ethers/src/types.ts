import {
  type BundlerClient,
  type EntryPointVersion,
  type SmartAccountClient,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Transport } from "viem";

export type EthersProviderAdapterOpts<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TAccount extends SmartContractAccount<EntryPointVersion> | undefined =
    | SmartContractAccount<EntryPointVersion>
    | undefined
> = {
  account?: TAccount;
} & (
  | {
      rpcProvider: string | BundlerClient<EntryPointVersion, TTransport>;
      chainId: number;
    }
  | {
      accountProvider: SmartAccountClient<
        EntryPointVersion,
        TTransport,
        TChain,
        TAccount
      >;
    }
);
