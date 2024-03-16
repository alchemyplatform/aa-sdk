import type { Chain, Client, Hex, SignableMessage, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import type { EntryPointVersion } from "../../entrypoint/types";
import { AccountNotFoundError } from "../../errors/account.js";

export type SignMessageParameters<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = { message: SignableMessage } & GetAccountParameter<
  TEntryPointVersion,
  TAccount
>;

export const signMessage: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SignMessageParameters<TEntryPointVersion, TAccount>
) => Promise<Hex> = async (client, { account = client.account, message }) => {
  if (!account) {
    throw new AccountNotFoundError();
  }
  return account.signMessage({ message });
};
