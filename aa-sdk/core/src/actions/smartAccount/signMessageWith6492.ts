import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount";
import { AccountNotFoundError } from "../../errors/account.js";
import type { SignMessageParameters } from "./signMessage";

export const signMessageWith6492: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SignMessageParameters<TAccount>
) => Promise<Hex> = async (client, { account = client.account, message }) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  return account.signMessageWith6492({ message });
};
