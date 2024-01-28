import {
  AccountNotFoundError,
  type GetAccountParameter,
  type Hex,
  type SmartAccountClient,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Chain, Transport } from "viem";
import type { LightAccount } from "../account";

export type TransferLightAccountOwnershipParams<
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TOwner> | undefined =
    | LightAccount<TOwner>
    | undefined
> = {
  newOwner: TOwner;
  waitForTxn?: boolean;
} & GetAccountParameter<TAccount, LightAccount>;

export const transferOwnership: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TOwner> | undefined =
    | LightAccount<TOwner>
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  args: TransferLightAccountOwnershipParams<TOwner, TAccount>
) => Promise<Hex> = async (
  client,
  { newOwner, waitForTxn, account = client.account }
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  const data = account.encodeTransferOwnership(await newOwner.getAddress());
  const result = await client.sendUserOperation({
    uo: {
      target: account.address,
      data,
      account,
    },
    account,
  });

  account.setOwner(newOwner);

  if (waitForTxn) {
    return client.waitForUserOperationTransaction(result);
  }

  return result.hash;
};
