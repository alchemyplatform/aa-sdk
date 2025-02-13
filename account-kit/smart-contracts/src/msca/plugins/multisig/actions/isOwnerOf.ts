import {
  AccountNotFoundError,
  type Address,
  type GetAccountParameter,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { type Chain, type Client, type Transport } from "viem";
import type { GetPluginAddressParameter } from "../../types.js";
import { MultisigPlugin } from "../plugin.js";

export async function isOwnerOf<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: { address: Address } & GetPluginAddressParameter &
    GetAccountParameter<TAccount>
) {
  const account = args.account ?? client.account;
  if (!account) {
    throw new AccountNotFoundError();
  }
  // TODO: check if the account actually has the plugin installed
  // either via account loupe or checking if the supports interface call passes on the account
  const contract = MultisigPlugin.getContract(client, args.pluginAddress);
  return await contract.read.isOwnerOf([account.address, args.address]);
}
