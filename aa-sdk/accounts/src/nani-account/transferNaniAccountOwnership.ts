import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Chain, Client, Hex, Transport } from "viem";
import type { NaniAccount } from "./account";

/**
 * Transfers ownership of the account to the newOwner on-chain and also updates the owner of the account.
 * Optionally waits for the transaction to be mined.
 *
 * @param client - the client to use to send the transaction
 * @param args - the arguments for the transfer
 * @returns the userOperation hash, or transaction hash if `waitForTxn` is true
 */
export const transferOwnership: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends NaniAccount | undefined = NaniAccount | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: {
    newOwner: TSigner;
    waitForTxn?: boolean;
  } & GetAccountParameter<TAccount>
) => Promise<Hex> = async (client, args): Promise<Hex> => {
  const {
    newOwner,
    waitForTxn = false,
    account: account_ = client.account,
  } = args;
  if (!account_) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "transferOwnership",
      client
    );
  }

  const account = account_ as NaniAccount;

  const data = account.encodeTransferOwnership(await newOwner.getAddress());
  const result = await client.sendUserOperation({
    uo: {
      target: account.address,
      data,
    },
    account,
  });

  if (waitForTxn) {
    return client.waitForUserOperationTransaction(result);
  }

  return result.hash;
};
