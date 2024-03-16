import type { EntryPointVersion } from "@alchemy/aa-core";
import {
  AccountNotFoundError,
  type GetAccountParameter,
  type IsUndefined,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Address, type Chain, type Client, type Transport } from "viem";
import type { GetPluginAddressParameter } from "../types.js";
import {
  MultiOwnerPlugin,
  multiOwnerPluginActions as multiOwnerPluginActions_,
  type MultiOwnerPluginActions as MultiOwnerPluginActions_,
} from "./plugin.js";

export type MultiOwnerPluginActions<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = MultiOwnerPluginActions_<TEntryPointVersion, TAccount> & {
  readOwners: (
    params: GetPluginAddressParameter &
      GetAccountParameter<TEntryPointVersion, TAccount>
  ) => Promise<ReadonlyArray<Address>>;

  isOwnerOf: (
    params: { address: Address } & GetPluginAddressParameter &
      GetAccountParameter<TEntryPointVersion, TAccount>
  ) => Promise<boolean>;
} & (IsUndefined<TAccount> extends false
    ? {
        readOwners: (
          params?: GetPluginAddressParameter &
            GetAccountParameter<TEntryPointVersion, TAccount>
        ) => Promise<ReadonlyArray<Address>>;
      }
    : {});

export const multiOwnerPluginActions: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => MultiOwnerPluginActions<TEntryPointVersion, TAccount> = <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) =>
  ({
    // @ts-ignore
    ...multiOwnerPluginActions_(client),
    async readOwners(
      args: GetPluginAddressParameter &
        GetAccountParameter<TEntryPointVersion, TAccount>
    ) {
      const account = args?.account ?? client.account;
      if (!account) {
        throw new AccountNotFoundError();
      }
      // TODO: check if the account actually has the plugin installed
      // either via account loupe or checking if the supports interface call passes on the account
      const contract = MultiOwnerPlugin.getContract(
        client,
        args?.pluginAddress
      );
      return contract.read.ownersOf([account.address]);
    },

    async isOwnerOf(
      args: { address: Address } & GetPluginAddressParameter &
        GetAccountParameter<TEntryPointVersion, TAccount>
    ) {
      const account = args.account ?? client.account;
      if (!account) {
        throw new AccountNotFoundError();
      }
      // TODO: check if the account actually has the plugin installed
      // either via account loupe or checking if the supports interface call passes on the account
      const contract = MultiOwnerPlugin.getContract(client, args.pluginAddress);
      return contract.read.isOwnerOf([account.address, args.address]);
    },
  } as MultiOwnerPluginActions<TEntryPointVersion, TAccount>);
