import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetEntryPointFromAccount,
  type SmartAccountSigner,
  type UserOperationOverridesParameter,
} from "@alchemy/aa-core";
import type { Address, Chain, Client, Hex, Transport } from "viem";
import type { MultiOwnerLightAccount } from "../accounts/multiOwner";

export type UpdateMultiOwnerLightAccountOwnersParams<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends MultiOwnerLightAccount<TSigner> | undefined =
    | MultiOwnerLightAccount<TSigner>
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  ownersToAdd: Address[];
  ownersToRemove: Address[];
  waitForTxn?: boolean;
} & GetAccountParameter<TAccount, MultiOwnerLightAccount<TSigner>> &
  UserOperationOverridesParameter<TEntryPointVersion>;

export const updateOwners: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends MultiOwnerLightAccount<TSigner> | undefined =
    | MultiOwnerLightAccount<TSigner>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: UpdateMultiOwnerLightAccountOwnersParams<TSigner, TAccount>
) => Promise<Hex> = async (
  client,
  {
    ownersToAdd,
    ownersToRemove,
    waitForTxn,
    overrides,
    account = client.account,
  }
) => {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "updateOwners",
      client
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
