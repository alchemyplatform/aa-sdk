import {
  AccountNotFoundError,
  type GetAccountParameter,
  type IsUndefined,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Address, type Chain, type Client, type Transport } from "viem";
import type { GetPluginAddressParameter } from "../types.js";
import {
  MultisigPlugin,
  multisigPluginActions as multisigPluginActions_,
  type MultisigPluginActions as MultisigPluginActions_,
} from "./plugin.js";

export type MultisigPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = MultisigPluginActions_<TAccount> & {
  readOwners: (
    params: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) => Promise<ReadonlyArray<Address>>;

  isOwnerOf: (
    params: { address: Address } & GetPluginAddressParameter &
      GetAccountParameter<TAccount>
  ) => Promise<boolean>;

  getThreshold: (
    params: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) => Promise<bigint>;
} & (IsUndefined<TAccount> extends false
    ? {
        readOwners: (
          params?: GetPluginAddressParameter & GetAccountParameter<TAccount>
        ) => Promise<ReadonlyArray<Address>>;
      }
    : {});

export const multisigPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => MultisigPluginActions<TAccount> = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => ({
  ...multisigPluginActions_(client),
  async readOwners(
    args: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) {
    const account = args?.account ?? client.account;
    if (!account) {
      throw new AccountNotFoundError();
    }
    // TODO: check if the account actually has the plugin installed
    // either via account loupe or checking if the supports interface call passes on the account
    const [owners] = await MultisigPlugin.getContract(
      client,
      args?.pluginAddress
    ).read.ownershipInfoOf([account.address]);
    return owners;
  },

  async isOwnerOf(
    args: { address: Address } & GetPluginAddressParameter &
      GetAccountParameter<TAccount>
  ) {
    const account = args.account ?? client.account;
    if (!account) {
      throw new AccountNotFoundError();
    }
    // TODO: check if the account actually has the plugin installed
    // either via account loupe or checking if the supports interface call passes on the account
    const contract = await MultisigPlugin.getContract(
      client,
      args.pluginAddress
    );
    return await contract.read.isOwnerOf([account.address, args.address]);
  },

  async getThreshold(
    args: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) {
    const account = args.account ?? client.account;
    if (!account) {
      throw new AccountNotFoundError();
    }
    const contract = await MultisigPlugin.getContract(
      client,
      args.pluginAddress
    );
    const [, threshold] = await contract.read.ownershipInfoOf([
      account.address,
    ]);
    return threshold;
  },
});
