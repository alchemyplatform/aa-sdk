import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type Hex,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import type { LightAccount } from "../account";

export type TransferLightAccountOwnershipParams<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TSigner> | undefined =
    | LightAccount<TSigner>
    | undefined,
> = {
  newOwner: TSigner;
  waitForTxn?: boolean;
} & GetAccountParameter<TAccount, LightAccount>;

export const transferOwnership: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TSigner> | undefined =
    | LightAccount<TSigner>
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
  args: TransferLightAccountOwnershipParams<TSigner, TAccount>,
) => Promise<Hex> = async (
  client,
  { newOwner, waitForTxn, account = client.account },
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "transferOwnership",
      client,
    );
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

  if (waitForTxn) {
    return client.waitForUserOperationTransaction(result);
  }

  return result.hash;
};
