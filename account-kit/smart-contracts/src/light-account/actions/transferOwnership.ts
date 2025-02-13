import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetEntryPointFromAccount,
  type SmartAccountSigner,
  type UserOperationOverridesParameter,
} from "@aa-sdk/core";
import type { Chain, Client, Hex, Transport } from "viem";
import type { LightAccount } from "../accounts/account";

export type TransferLightAccountOwnershipParams<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TSigner> | undefined =
    | LightAccount<TSigner>
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  newOwner: TSigner;
  waitForTxn?: boolean;
} & GetAccountParameter<TAccount, LightAccount<TSigner>> &
  UserOperationOverridesParameter<TEntryPointVersion>;

/**
 * Transfers the ownership of a light account to a new owner.
 * This function ensures that the client is a compatible smart acccount client and that a Light Account is provided.
 * If the waitForTxn parameter is true, it will wait for the transaction to be completed before returning.
 *
 * @example
 * ```ts
 * import { transferOwnership, createLightAccountClient } from "@account-kit/smart-contracts";
 *
 * const lightAccountClient = createLightAccountClient({
 *  signer,
 *  transport,
 *  chain,
 * });
 *
 * const txHash = await transferOwnership(lightAccountClient, {
 *  newOwner: newOwnerSigner,
 *  waitForTxn: true, // set to false to return a uoHash instead
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The smart account client instance used to execute the transfer
 * @param {TransferLightAccountOwnershipParams<TSigner, TAccount>} args The parameters for transferring ownership
 * @returns {Promise<Hex>} The transaction or UO hash as a Hex string
 */
export const transferOwnership = async <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TSigner> | undefined =
    | LightAccount<TSigner>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: TransferLightAccountOwnershipParams<TSigner, TAccount>
): Promise<Hex> => {
  const { newOwner, waitForTxn, overrides, account = client.account } = args;
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
