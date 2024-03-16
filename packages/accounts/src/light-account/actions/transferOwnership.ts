import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type EntryPointVersion,
  type GetAccountParameter,
  type SmartAccountSigner,
  type UserOperationOverridesParameter,
} from "@alchemy/aa-core";
import type { Chain, Client, Hex, Transport } from "viem";
import type { LightAccount } from "../account";

export type TransferLightAccountOwnershipParams<
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TEntryPointVersion, TSigner> | undefined =
    | LightAccount<TEntryPointVersion, TSigner>
    | undefined
> = {
  newOwner: TSigner;
  waitForTxn?: boolean;
} & GetAccountParameter<
  TEntryPointVersion,
  TAccount,
  LightAccount<TEntryPointVersion>
> &
  UserOperationOverridesParameter<TEntryPointVersion>;

export const transferOwnership: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TEntryPointVersion, TSigner> | undefined =
    | LightAccount<TEntryPointVersion, TSigner>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: TransferLightAccountOwnershipParams<
    TEntryPointVersion,
    TSigner,
    TAccount
  >
) => Promise<Hex> = async (
  client,
  { newOwner, waitForTxn, overrides, account = client.account }
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "transferOwnership",
      client
    );
  }

  const data = account.encodeTransferOwnership(await newOwner.getAddress());

  const result = await client.sendUserOperation({
    uo: {
      target: account.address,
      data,
    },
    account,
    overrides,
  });

  if (waitForTxn) {
    return client.waitForUserOperationTransaction(result);
  }

  return result.hash;
};
