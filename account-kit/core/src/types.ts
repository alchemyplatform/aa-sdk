import type { ConnectionConfig } from "@aa-sdk/core";
import type {
  AlchemyTransport,
  AlchemyTransportConfig,
} from "@account-kit/infra";
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
export type Connection = {
  transport: AlchemyTransportConfig;
  chain: Chain;
  policyId?: string;
};

type RpcConnectionConfig =
  | {
      chain: Chain;
      chains: {
        chain: Chain;
        policyId?: string;
        // optional transport override
        transport?: AlchemyTransport;
      }[];
      // optional global transport to use for all chains
      transport: AlchemyTransport;
      // When providing multiple chains and no default transport, the signer connection is required
      signerConnection?: ConnectionConfig;
      policyId?: never;
    }
  | {
      chain: Chain;
      chains: {
        chain: Chain;
        policyId?: string;
        transport: AlchemyTransport;
      }[];
      transport?: never;
      // When providing multiple chains, then the signer connection is required
      signerConnection: ConnectionConfig;
      policyId?: never;
    }
  | {
      transport: AlchemyTransport;
      chain: Chain;
      policyId?: string;
      signerConnection?: ConnectionConfig;
      chains?: never;
    };

export type CreateConfigProps = RpcConnectionConfig & {
  sessionConfig?: AlchemySignerParams["sessionConfig"] & { domain?: string };
  /**
   * Enable this parameter if you are using the config in an SSR setting (eg. NextJS)
   * Turing this setting on will disable automatic hydration of the client store
   */
  ssr?: boolean;

  // TODO: should probably abstract this out into a function
  storage?: (config?: { sessionLength?: number; domain?: string }) => Storage;

  connectors?: CreateConnectorFn[];

  /**
   * If set, calls `preparePopupOauth` immediately upon initializing the signer.
   * If you intend to use popup-based OAuth login, you must either set this
   * option to true or manually ensure that you call
   * `signer.preparePopupOauth()` at some point before the user interaction that
   * triggers the OAuth authentication flow.
   */
  enablePopupOauth?: boolean;
} & Omit<
    PartialBy<
      Exclude<AlchemySignerParams["client"], AlchemySignerWebClient>,
      "iframeConfig"
    >,
    "connection"
  >;
// [!endregion CreateConfigProps]

export type AlchemyClientState = StoredState;
