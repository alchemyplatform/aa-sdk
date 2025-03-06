import type { SmartAccountSigner } from "@aa-sdk/core";
import type { Chain, Client, Hex, Transport } from "viem";
import type { LightAccount } from "../accounts/account";
import {
  transferOwnership,
  type TransferLightAccountOwnershipParams,
} from "../actions/transferOwnership.js";

export type LightAccountClientActions<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TSigner> | undefined =
    | LightAccount<TSigner>
    | undefined
> = {
  transferOwnership: (
    args: TransferLightAccountOwnershipParams<TSigner, TAccount>
  ) => Promise<Hex>;
};

/**
 * Provides a set of actions for managing a light account client, including transferring ownership.
 *
 * @example
 * ```ts
 * import { lightAccountClientActions, createLightAccount } from "@account-kit/smart-contracts";
 * import { createAlchemySmartAccountClient } from "@account-kit/infra";
 * import { sepolia } from "@account-kit/infra";
 *
 * const smartAccountClient = createAlchemySmartAccountClient({
 *  account: await createLightAccount(...),
 *  apiKey: "your-api-key",
 *  chain: sepolia,
 * }).extend(lightAccountClientActions);
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance for which to provide the light account actions
 * @returns {LightAccountClientActions<TSigner, TAccount>} An object containing the available light account client actions
 */
export const lightAccountClientActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TSigner> | undefined =
    | LightAccount<TSigner>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => LightAccountClientActions<TSigner, TAccount> = (client) => ({
  transferOwnership: async (args) => transferOwnership(client, args),
});
