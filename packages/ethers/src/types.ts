import {
  type BundlerClient,
  type EntryPointVersion,
  type SmartAccountClient,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Transport } from "viem";

export type EthersProviderAdapterOpts<
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined,
  TEntryPointVersion extends EntryPointVersion = TAccount extends SmartContractAccount<
    infer U
  >
    ? U
    : EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain
> = {
  account?: TAccount;
} & (
  | {
      rpcProvider: string | BundlerClient<TEntryPointVersion, TTransport>;
      chainId: number;
    }
  | {
      accountProvider: SmartAccountClient<
        TEntryPointVersion,
        TTransport,
        TChain,
        TAccount
      >;
    }
);
