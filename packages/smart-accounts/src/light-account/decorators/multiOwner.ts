import type { Address, Chain, Client, Hex, IsUndefined, Transport } from "viem";
import { sendUserOperation, type SmartAccount } from "viem/account-abstraction";
import { getAction } from "viem/utils";
import type { GetAccountParameter } from "../../types.js";
import type { MultiOwnerLightAccount } from "../accounts/multi-owner-account.js";
import { AccountNotFoundError } from "@alchemy/common";

export type MultiOwnerLightAccountActions<
  TAccount extends MultiOwnerLightAccount | undefined =
    | MultiOwnerLightAccount
    | undefined,
> = {
  updateOwners: (
    args: {
      ownersToAdd: Address[];
      ownersToRemove: Address[];
    } & GetAccountParameter<TAccount, MultiOwnerLightAccount>,
  ) => Promise<Hex>;
};

function isMultiOwnerLightAccount(
  account: SmartAccount,
): account is MultiOwnerLightAccount {
  return "source" in account && account.source === "MultiOwnerLightAccount";
}

/**
 * Generates client actions for a multi-owner light account, including the ability to update owners.
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance used to interact with the account
 * @returns {MultiOwnerLightAccountActions<TAccount>} An object containing the client actions specifically for a multi-owner light account
 */
export function multiOwnerLightAccountActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): MultiOwnerLightAccountActions<
  IsUndefined<TAccount> extends true ? undefined : MultiOwnerLightAccount
> {
  return {
    // TODO(v5): Another pattern I think we should consider deprecating for v5 - actions that
    // implicitly do a sendUserOperation internally. These are non-composable with batching
    // and have a number of other issues that are solved with viem writeContract.
    updateOwners: async (args) => {
      const { ownersToAdd, ownersToRemove, account = client.account } = args;

      if (!account || !isMultiOwnerLightAccount(account)) {
        throw new AccountNotFoundError();
      }

      const data = account.encodeUpdateOwners(ownersToAdd, ownersToRemove);

      const action = getAction(client, sendUserOperation, "sendUserOperation");
      const result = await action({
        calls: [
          {
            to: account.address,
            data,
          },
        ],
        account,
      });

      return result;
    },
  };
}
