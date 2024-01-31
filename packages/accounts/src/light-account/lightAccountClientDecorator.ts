import type {
  GetAccountParameter,
  Hex,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import type { LightAccount } from "./account";
import { transferOwnership } from "./actions/transferOwnership.js";

export type LightAccountClientActions<
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TOwner> | undefined =
    | LightAccount<TOwner>
    | undefined
> = {
  transferOwnership: (
    args: {
      newOwner: TOwner;
      waitForTxn?: boolean;
    } & GetAccountParameter<TAccount, LightAccount>
  ) => Promise<Hex>;
};

export const lightAccountClientActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TOwner> | undefined =
    | LightAccount<TOwner>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => LightAccountClientActions<TOwner, TAccount> = (client) => ({
  transferOwnership: async (args) => transferOwnership(client, args),
});
