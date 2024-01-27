import type {
  GetAccountParameter,
  SmartAccountClient,
  SmartContractAccount,
} from "@alchemy/aa-core/viem";
import { type Address, type Chain, type Transport } from "viem";
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
};

export const multiOwnerPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>
) => MultiOwnerPluginActions<TAccount> = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>
) => ({
  ...multiOwnerPluginActions_(client),
  async readOwners({ pluginAddress, account = client.account }) {
    if (!account) {
      throw new Error("Account is required");
    }
    // TODO: check if the account actually has the plugin installed
    // either via account loupe or checking if the supports interface call passes on the account
    const contract = MultiOwnerPlugin.getContract(client, pluginAddress);
    return contract.read.ownersOf([account.address]);
  },
});
