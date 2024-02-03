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
import { AccountNotFoundError } from "../../errors/account.js";

export type SignTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  typedData: TypedDataDefinition<TTypedData, TPrimaryType>;
} & GetAccountParameter<TAccount>;

export const signTypedData: <
  const TTypedData extends TypedData | { [key: string]: unknown },
  TPrimaryType extends string = string,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SignTypedDataParameters<TTypedData, TPrimaryType, TAccount>
) => Promise<Hex> = async (client, { account = client.account, typedData }) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  return account.signTypedData(typedData);
};
