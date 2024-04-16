import type { SmartAccountSigner } from "@alchemy/aa-core";
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
