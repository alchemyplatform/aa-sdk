import type { Address } from "abitype";
import type { Chain, Client, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import { AccountNotFoundError } from "../../errors/account.js";

export const getAddress: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: GetAccountParameter<TAccount>
) => Address = (client, args) => {
  const { account } = args ?? { account: client.account };
  if (!account) {
    throw new AccountNotFoundError();
  }

  return account.address;
};
