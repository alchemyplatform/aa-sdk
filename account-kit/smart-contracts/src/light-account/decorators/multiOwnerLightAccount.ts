import type { SmartAccountSigner } from "@aa-sdk/core";
import type { Chain, Client, Hex, Transport } from "viem";
import type { MultiOwnerLightAccount } from "../accounts/multiOwner";
import {
  updateOwners,
  type UpdateMultiOwnerLightAccountOwnersParams,
} from "../actions/updateOwners.js";

export type MultiOwnerLightAccountClientActions<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends MultiOwnerLightAccount<TSigner> | undefined =
    | MultiOwnerLightAccount<TSigner>
    | undefined
> = {
  updateOwners: (
    args: UpdateMultiOwnerLightAccountOwnersParams<TSigner, TAccount>
  ) => Promise<Hex>;
};

/**
 * Generates client actions for a multi-owner light account, including the ability to update owners.
 *
 * @example
 * ```ts
 * import { multiOwnerLightAccountClientActions, createMultiOwnerLightAccount } from "@account-kit/smart-contracts";
 * import { createAlchemySmartAccountClient } from "@account-kit/infra";
 * import { sepolia } from "@account-kit/infra";
 *
 * const smartAccountClient = createAlchemySmartAccountClient({
 *  account: await createMultiOwnerLightAccount(...),
 *  apiKey: "your-api-key",
 *  chain: sepolia,
 * }).extend(multiOwnerLightAccountClientActions);
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client the client for interacting with the multi-owner light account
 * @returns {MultiOwnerLightAccountClientActions<TSigner, TAccount>} an object containing the client actions specifically for a multi-owner light account
 */
export const multiOwnerLightAccountClientActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends MultiOwnerLightAccount<TSigner> | undefined =
    | MultiOwnerLightAccount<TSigner>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => MultiOwnerLightAccountClientActions<TSigner, TAccount> = (client) => ({
  updateOwners: async (args) => updateOwners(client, args),
});
