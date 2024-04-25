import type {
  LightAccount,
  MultiOwnerModularAccount,
} from "@alchemy/aa-accounts";
import type { LightAccountVersion } from "@alchemy/aa-accounts/dist/types/src/light-account/types";
import type { ConnectionConfig } from "@alchemy/aa-core";
import type { Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { ClientWithAlchemyMethods } from "../client/types";
import type {
  AlchemySigner,
  AlchemySignerClient,
  AlchemySignerParams,
} from "../signer";
import type { ClientStore, CoreStore } from "./store/types";

export type SupportedAccountTypes = "LightAccount" | "MultiOwnerModularAccount";

export type SupportedAccounts =
  | LightAccount<AlchemySigner>
  | MultiOwnerModularAccount<AlchemySigner>;

export type SupportedAccount<T extends SupportedAccountTypes> =
  T extends "LightAccount"
    ? LightAccount<
        AlchemySigner,
        // we only support LightAccount version v1
        Exclude<LightAccountVersion<"LightAccount">, "v2.0.0">
      >
    : T extends "MultiOwnerModularAccount"
    ? MultiOwnerModularAccount<AlchemySigner>
    : never;

export type AlchemyAccountsConfig = {
  bundlerClient: ClientWithAlchemyMethods;
  signer: AlchemySigner;
  coreStore: CoreStore;
  clientStore: ClientStore;
};

// #region CreateConfigProps
export type CreateConfigProps = ConnectionConfig & {
  chain: Chain;
  sessionConfig?: AlchemySignerParams["sessionConfig"];
  /**
   * Optional parameter that allows you to specify a different RPC Url
   * or connection to be used specifically by the signer.
   * This is useful if you have a different backend proxy for the signer
   * than for your Bundler or Node RPC calls.
   */
  signerConnection?: ConnectionConfig;
} & Omit<
    PartialBy<
      Exclude<AlchemySignerParams["client"], AlchemySignerClient>,
      "iframeConfig"
    >,
    "connection"
  >;
// #endregion CreateConfigProps
