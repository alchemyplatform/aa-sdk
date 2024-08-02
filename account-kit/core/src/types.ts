import type { ConnectionConfig } from "@aa-sdk/core";
import type {
  AlchemySignerParams,
  AlchemySignerWebClient,
  AlchemyWebSigner,
} from "@account-kit/signer";
import type {
  LightAccount,
  LightAccountVersion,
  MultiOwnerLightAccount,
  MultiOwnerModularAccount,
} from "@account-kit/smart-contracts";
import type { CreateConnectorFn } from "@wagmi/core";
import { type Config as WagmiConfig } from "@wagmi/core";
import type { Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { Store, StoredState } from "./store/types";

export type SupportedAccountTypes =
  | "MultiOwnerLightAccount"
  | "LightAccount"
  | "MultiOwnerModularAccount";

export type SupportedAccounts =
  | LightAccount<AlchemyWebSigner, LightAccountVersion<"LightAccount">>
  | MultiOwnerModularAccount<AlchemyWebSigner>
  | MultiOwnerLightAccount<
      AlchemyWebSigner,
      LightAccountVersion<"MultiOwnerLightAccount">
    >;

export type SupportedAccount<T extends SupportedAccountTypes> =
  T extends "LightAccount"
    ? LightAccount<AlchemyWebSigner>
    : T extends "MultiOwnerModularAccount"
    ? MultiOwnerModularAccount<AlchemyWebSigner>
    : T extends "MultiOwnerLightAccount"
    ? MultiOwnerLightAccount<AlchemyWebSigner>
    : never;

export type AlchemyAccountsConfig = {
  store: Store;
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
  policyId?: string;
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
      chains?: never;
    })
  | {
      connections: Connection[];
      chain: Chain;
      /**
       * When providing multiple connections, you must specify the signer connection config
       * to use since the signer is chain agnostic and has a different RPC url.
       */
      signerConnection: ConnectionConfig;
      chains?: never;
    }
  | {
      connections?: never;
      apiKey: string;
      chain: Chain;
      chains: { chain: Chain; policyId?: string }[];
      /**
       * Optional parameter that allows you to specify a different RPC Url
       * or connection to be used specifically by the signer.
       * This is useful if you have a different backend proxy for the signer
       * than for your Bundler or Node RPC calls.
       */
      signerConnection?: ConnectionConfig;
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
      Exclude<AlchemySignerParams["client"], AlchemySignerWebClient>,
      "iframeConfig"
    >,
    "connection"
  >;
// [!endregion CreateConfigProps]

export type AlchemyClientState = StoredState;
