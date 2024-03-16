import type { Chain, Client, Hex, Transport, TypedData } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount";
import type { EntryPointVersion } from "../../entrypoint/types";
import { AccountNotFoundError } from "../../errors/account.js";
import type { SignTypedDataParameters } from "./signTypedData";

export const signTypedDataWith6492: <
  const TEntryPointVersion extends EntryPointVersion,
  const TTypedData extends TypedData | { [key: string]: unknown },
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined,
  TPrimaryType extends string = string
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SignTypedDataParameters<
    TEntryPointVersion,
    TTypedData,
    TPrimaryType,
    TAccount
  >
) => Promise<Hex> = async (client, { account = client.account, typedData }) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  return account.signTypedDataWith6492(typedData);
};
