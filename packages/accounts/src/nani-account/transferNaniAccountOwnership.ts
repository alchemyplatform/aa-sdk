import {
  AccountNotFoundError,
  type GetAccountParameter,
  type SmartAccountClient,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Chain, Hex, Transport } from "viem";
import type { NaniAccount } from "./account";

/**
 * Transfers ownership of the account to the newOwner on-chain and also updates the owner of the account.
 * Optionally waits for the transaction to be mined.
 *
 * @param client - the client to use to send the transaction
 * @param newOwner - the new owner of the account
 * @param waitForTxn - whether or not to wait for the transaction to be mined
 * @returns {Hash} the userOperation hash, or transaction hash if `waitForTxn` is true
 */
export const transferOwnership: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends NaniAccount | undefined = NaniAccount | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  args: {
    newOwner: TOwner;
    waitForTxn?: boolean;
  } & GetAccountParameter<TAccount>
) => Promise<Hex> = async (
  client,
  { newOwner, waitForTxn = false, account: account_ = client.account }
): Promise<Hex> => {
  if (!account_) {
    throw new AccountNotFoundError();
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
