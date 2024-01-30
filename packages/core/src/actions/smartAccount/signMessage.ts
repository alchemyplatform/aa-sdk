import type { Chain, Hex, SignableMessage, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../client/smartAccountClient";
import { AccountNotFoundError } from "../../errors/account.js";

export type SignMessageParameters<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = { message: SignableMessage } & GetAccountParameter<TAccount>;

export const signMessage: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: SignMessageParameters<TAccount>
) => Promise<Hex> = async (client, { account = client.account, message }) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  return account.signMessage({ message });
};
