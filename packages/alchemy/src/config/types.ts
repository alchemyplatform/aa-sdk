import type {
  LightAccount,
  MultiOwnerModularAccount,
} from "@alchemy/aa-accounts";
import type { ConnectionConfig } from "@alchemy/aa-core";
import type { CreateConnectorFn } from "@wagmi/core";
import { type Config as WagmiConfig } from "@wagmi/core";
import type { Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { AlchemyGasManagerConfig } from "../middleware/gasManager";
import type {
  AlchemySigner,
  AlchemySignerClient,
  AlchemySignerParams,
} from "../signer";
import type { ClientStore, CoreStore, StoredState } from "./store/types";

export type SupportedAccountTypes = "LightAccount" | "MultiOwnerModularAccount";

export type SupportedAccounts =
  | LightAccount<AlchemySigner>
  | MultiOwnerModularAccount<AlchemySigner>;

export type SupportedAccount<T extends SupportedAccountTypes> =
  T extends "LightAccount"
    ? LightAccount<AlchemySigner>
    : T extends "MultiOwnerModularAccount"
    ? MultiOwnerModularAccount<AlchemySigner>
    : never;

export type AlchemyAccountsConfig = {
  coreStore: CoreStore;
  clientStore: ClientStore;
  _internal: {
    wagmiConfig: WagmiConfig;
    ssr?: boolean;
    storageKey: string;
    sessionLength: number;
  };
};

// [!region CreateConfigProps]
export type Connection = ConnectionConfig & {
  chain: Chain;
  gasManagerConfig?: AlchemyGasManagerConfig;
};

type RpcConnectionConfig =
  | (Connection & {
      /**
       * Optional parameter that allows you to specify a different RPC Url
       * or connection to be used specifically by the signer.
       * This is useful if you have a different backend proxy for the signer
       * than for your Bundler or Node RPC calls.
       */
      signerConnection?: ConnectionConfig;
      connections?: never;
    })
  | {
      connections: Connection[];
      chain: Chain;
      /**
       * When providing multiple connections, you must specify the signer connection config
       * to use since the signer is chain agnostic and has a different RPC url.
       */
      signerConnection: ConnectionConfig;
    };

export type CreateConfigProps = RpcConnectionConfig & {
  chain: Chain;
  sessionConfig?: AlchemySignerParams["sessionConfig"];
  /**
   * Enable this parameter if you are using the config in an SSR setting (eg. NextJS)
   * Turing this setting on will disable automatic hydration of the client store
   */
  ssr?: boolean;

  // TODO: should probably abstract this out into a function
  storage?: (config?: { sessionLength: number }) => Storage;

  connectors?: CreateConnectorFn[];
} & Omit<
    PartialBy<
      Exclude<AlchemySignerParams["client"], AlchemySignerClient>,
      "iframeConfig"
    >,
    "connection"
  >;
// [!endregion CreateConfigProps]

export type AlchemyClientState = StoredState;
