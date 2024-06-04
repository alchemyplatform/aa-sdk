import type { SmartAccountSigner } from "@alchemy/aa-core";
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
