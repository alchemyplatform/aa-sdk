import type {
  Chain,
  Client,
  Hex,
  Transport,
  TypedData,
  TypedDataDefinition,
} from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import type { EntryPointVersion } from "../../entrypoint/types";
import { AccountNotFoundError } from "../../errors/account.js";

export type SignTypedDataParameters<
  TEntryPointVersion extends EntryPointVersion,
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  typedData: TypedDataDefinition<TTypedData, TPrimaryType>;
} & GetAccountParameter<TEntryPointVersion, TAccount>;

export const signTypedData: <
  TEntryPointVersion extends EntryPointVersion,
  const TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
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

  return account.signTypedData(typedData);
};
