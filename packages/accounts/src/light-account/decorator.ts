import type { EntryPointVersion, SmartAccountSigner } from "@alchemy/aa-core";
import type { Chain, Client, Hex, Transport } from "viem";
import type { LightAccount } from "./account";
import {
  transferOwnership,
  type TransferLightAccountOwnershipParams,
} from "./actions/transferOwnership.js";

export type LightAccountClientActions<
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TEntryPointVersion, TSigner> | undefined =
    | LightAccount<TEntryPointVersion, TSigner>
    | undefined
> = {
  transferOwnership: (
    args: TransferLightAccountOwnershipParams<
      TEntryPointVersion,
      TSigner,
      TAccount
    >
  ) => Promise<Hex>;
};

export const lightAccountClientActions: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TEntryPointVersion, TSigner> | undefined =
    | LightAccount<TEntryPointVersion, TSigner>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => LightAccountClientActions<TEntryPointVersion, TSigner, TAccount> = (
  client
) => ({
  transferOwnership: async (args) => transferOwnership(client, args),
});
