import { AccountNotFoundError } from "@aa-sdk/core";
import type { Address, Chain, Client, Hex, IsUndefined, Transport } from "viem";
import { sendUserOperation, type SmartAccount } from "viem/account-abstraction";
import { getAction } from "viem/utils";
import type { GetAccountParameter } from "../../types";
import type { LightAccount } from "../accounts/account";

export type LightAccountActions<
  TAccount extends LightAccount | undefined = LightAccount | undefined,
> = {
  transferOwnership: (
    args: {
      newOwner: Address;
    } & GetAccountParameter<TAccount, LightAccount>,
  ) => Promise<Hex>;
};

function isLightAccount(account: SmartAccount): account is LightAccount {
  return "source" in account && account.source === "LightAccount";
}

/**
 * A decorator that can be used with viem's bundler client to add light account actions to the client
 *
 * @param {BundlerClient<TTransport, TChain, TAccount>} client The client instance for which to provide the light account actions
 * @returns {LightAccountActions<TAccount>} An object containing the available light account actions
 */
export function singleOwnerLightAccountActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): LightAccountActions<
  IsUndefined<TAccount> extends true ? undefined : LightAccount
> {
  // TODO(v5): refactor this out to its own function if needed
  return {
    transferOwnership: async (args) => {
      const { newOwner, account = client.account } = args;

      if (!account || !isLightAccount(account)) {
        throw new AccountNotFoundError();
      }

      const data = account.encodeTransferOwnership(newOwner);

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
