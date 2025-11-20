import type { Address, Chain, Client, Hex, IsUndefined, Transport } from "viem";
import { sendUserOperation, type SmartAccount } from "viem/account-abstraction";
import { getAction } from "viem/utils";
import type { GetAccountParameter } from "../../types.js";
import { AccountNotFoundError } from "@alchemy/common";
import type { MultiOwnerModularAccountV1 } from "../multi-owner-account.js";

export type MultiOwnerModularAccountV1Actions<
  TAccount extends MultiOwnerModularAccountV1 | undefined =
    | MultiOwnerModularAccountV1
    | undefined,
> = {
  updateOwners: (
    args: {
      ownersToAdd: Address[];
      ownersToRemove: Address[];
    } & GetAccountParameter<TAccount, MultiOwnerModularAccountV1>,
  ) => Promise<Hex>;
};

function isMultiOwnerModularAccountV1(
  account: SmartAccount,
): account is MultiOwnerModularAccountV1 {
  return "source" in account && account.source === "MultiOwnerModularAccountV1";
}

/**
 * Generates client actions for a multi-owner MAv1 account, including the ability to update owners.
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance used to interact with the account
 * @returns {MultiOwnerLightAccountActions<TAccount>} An object containing the client actions specifically for a multi-owner modular account
 */
export function multiOwnerModularAccountV1Actions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): MultiOwnerModularAccountV1Actions<
  IsUndefined<TAccount> extends true ? undefined : MultiOwnerModularAccountV1
> {
  return {
    // TODO(v5): Another pattern I think we should consider deprecating for v5 - actions that
    // implicitly do a sendUserOperation internally. These are non-composable with batching
    // and have a number of other issues that are solved with viem writeContract.
    updateOwners: async (args) => {
      const { ownersToAdd, ownersToRemove, account = client.account } = args;

      if (!account || !isMultiOwnerModularAccountV1(account)) {
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
