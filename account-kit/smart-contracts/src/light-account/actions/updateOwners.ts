import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetEntryPointFromAccount,
  type SmartAccountSigner,
  type UserOperationOverridesParameter,
} from "@aa-sdk/core";
import type { Address, Chain, Client, Hex, Transport } from "viem";
import type { MultiOwnerLightAccount } from "../accounts/multiOwner";

export type UpdateMultiOwnerLightAccountOwnersParams<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends MultiOwnerLightAccount<TSigner> | undefined =
    | MultiOwnerLightAccount<TSigner>
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
> = {
  ownersToAdd: Address[];
  ownersToRemove: Address[];
  waitForTxn?: boolean;
} & GetAccountParameter<TAccount, MultiOwnerLightAccount<TSigner>> &
  UserOperationOverridesParameter<TEntryPointVersion>;

/**
 * Updates the owners of a multi-owner light account. This includes adding new owners and removing existing ones.
 *
 * @example
 * ```ts
 * import { updateOwners, createLightAccountClient } from "@account-kit/smart-contracts";
 *
 * const lightAccountClient = createLightAccountClient({
 *  signer,
 *  transport,
 *  chain,
 * });
 *
 * const txHash = await updateOwners(lightAccountClient, {
 *  ownerstoAdd: [newOwnerAddress], // or empty if you just want to remove owners
 *  ownersToRemove: [oldOwnerAddress], // or empty if you just want to add owners
 *  waitForTxn: true, // set to false to return a uoHash instead
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance used to interact with the account
 * @param {UpdateMultiOwnerLightAccountOwnersParams<TSigner, TAccount>} args The parameters for updating the account owners
 * @returns {Promise<Hex>} A promise that resolves to the transaction hash or the full transaction result if `waitForTxn` is `true`
 */
export const updateOwners: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends MultiOwnerLightAccount<TSigner> | undefined =
    | MultiOwnerLightAccount<TSigner>
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
  args: UpdateMultiOwnerLightAccountOwnersParams<TSigner, TAccount>,
) => Promise<Hex> = async (
  client,
  {
    ownersToAdd,
    ownersToRemove,
    waitForTxn,
    overrides,
    account = client.account,
  },
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "updateOwners",
      client,
    );
  }

  const data = account.encodeUpdateOwners(ownersToAdd, ownersToRemove);

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
