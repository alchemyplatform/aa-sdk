import {
  AccountNotFoundError,
  type GetAccountParameter,
  type IsUndefined,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Address, type Chain, type Client, type Transport } from "viem";
import {
  MultiOwnerPlugin,
  multiOwnerPluginActions as multiOwnerPluginActions_,
  type MultiOwnerPluginActions as MultiOwnerPluginActions_,
} from "./plugin.js";

export type MultiOwnerPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = MultiOwnerPluginActions_<TAccount> & {
  readOwners: (
    params: { pluginAddress?: Address } & GetAccountParameter<TAccount>
  ) => Promise<ReadonlyArray<Address>>;
} & (IsUndefined<TAccount> extends false
    ? {
        readOwners: (
          params?: { pluginAddress?: Address } & GetAccountParameter<TAccount>
        ) => Promise<ReadonlyArray<Address>>;
      }
    : {});

export const multiOwnerPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => MultiOwnerPluginActions<TAccount> = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => ({
  ...multiOwnerPluginActions_(client),
  async readOwners(
    args: { pluginAddress?: Address } & GetAccountParameter<TAccount>
  ) {
    const account = args?.account ?? client.account;
    if (!account) {
      throw new AccountNotFoundError();
    }
    // TODO: check if the account actually has the plugin installed
    // either via account loupe or checking if the supports interface call passes on the account
    const contract = MultiOwnerPlugin.getContract(client, args?.pluginAddress);
    return contract.read.ownersOf([account.address]);
  },
});
