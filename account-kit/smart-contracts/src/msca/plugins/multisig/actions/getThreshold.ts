import {
  AccountNotFoundError,
  type GetAccountParameter,
  type SmartContractAccount,
} from "@aa-sdk/core";
import { type Chain, type Client, type Transport } from "viem";
import { isMultisigModularAccount } from "../../../account/multisigAccount.js";
import type { GetPluginAddressParameter } from "../../types.js";
import { MultisigPlugin } from "../plugin.js";
import { MultisigAccountExpectedError } from "../../../errors.js";

export async function getThreshold<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
  args: GetPluginAddressParameter & GetAccountParameter<TAccount>,
) {
  const account = args.account ?? client.account;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isMultisigModularAccount(account)) {
    throw new MultisigAccountExpectedError();
  }

  const [, threshold] = await MultisigPlugin.getContract(
    client,
    args.pluginAddress,
  ).read.ownershipInfoOf([account.address]);

  return threshold === 0n ? account.getLocalThreshold() : threshold;
}
