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
  ModularAccountV2,
} from "@account-kit/smart-contracts";
import type { CreateConnectorFn } from "@wagmi/core";
import { type Config as WagmiConfig } from "@wagmi/core";
import type { Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { ClientStoreConfig, Store, StoredState } from "./store/types";
import type {
  RNAlchemySignerSingleton as RNAlchemySigner,
  RNSignerClient,
} from "@account-kit/react-native-signer";
import type { Connection as SolanaWeb3Connection } from "@solana/web3.js";
export type SupportedAccountTypes =
  | "MultiOwnerLightAccount"
  | "LightAccount"
  | "MultiOwnerModularAccount"
  | "ModularAccountV2";

export type SupportedAccounts =
  | LightAccount<AlchemySigner, LightAccountVersion<"LightAccount">>
  | MultiOwnerModularAccount<AlchemySigner>
  | MultiOwnerLightAccount<
      AlchemySigner,
      LightAccountVersion<"MultiOwnerLightAccount">
    >
  | ModularAccountV2<AlchemySigner>;

export type SupportedAccount<T extends SupportedAccountTypes> =
  T extends "LightAccount"
    ? LightAccount<AlchemySigner>
    : T extends "MultiOwnerModularAccount"
    ? MultiOwnerModularAccount<AlchemySigner>
    : T extends "MultiOwnerLightAccount"
    ? MultiOwnerLightAccount<AlchemySigner>
    : T extends "ModularAccountV2"
    ? ModularAccountV2<AlchemySigner>
    : never;

export type AlchemyAccountsConfig = {
  store: Store;
  _internal: {
    // if not provided, the default signer will be used
    createSigner: (config: ClientStoreConfig) => AlchemySigner;
    wagmiConfig: WagmiConfig;
    ssr?: boolean;
    storageKey: string;
    sessionLength: number;
  };
};
// [!region CreateCorConfigProps]
export type ViemConnection = {
  transport: AlchemyTransportConfig;
  chain: Chain;
  policyId?: string | string[];
};

export type Web3Chain = Pick<Chain, "name" | "nativeCurrency"> & { id: string };

export type Web3Connection = {
  connection: SolanaWeb3Connection;
  chain: Web3Chain;
  policyId?: string;
};
/**
 * Checks if the connection is a viem/ transport connection
 *
 * @param {Connection} connection - The connection to check
 * @returns {connection is ViemConnect} true if the connection is a Viem connection, false otherwise
 */
export function isViemConnection(
  connection: Connection
): connection is ViemConnection {
  return "transport" in connection;
}
/**
 * Checks if the connection is a web3 connection
 *
 * @param {Connection} connection - The connection to check
 * @returns {connection is Web3Connection} true if the connection is a web3 connection, false otherwise
 */
export function isWeb3Connection(
  connection: Connection
): connection is Web3Connection {
  return "connection" in connection;
}

export type Connection = Web3Connection | ViemConnection;

export type Web3ChainConfig = {
  chain: Web3Chain;
  connection: SolanaWeb3Connection;
  policyId?: string;
};

export function isWeb3ChainConfig(
  connection: object
): connection is Web3ChainConfig {
  return "connection" in connection;
}
type RpcConnectionConfig =
  | {
      chain: Chain;
      chains: (
        | {
            chain: Chain;
            policyId?: string | string[];
            // optional transport override
            transport?: AlchemyTransport;
          }
        | Web3ChainConfig
      )[];
      // optional global transport to use for all chains
      transport: AlchemyTransport;
      // When providing multiple chains and no default transport, the signer connection is required
      signerConnection?: ConnectionConfig;
      policyId?: never;
    }
  | {
      chain: Chain;
      chains: (
        | {
            chain: Chain;
            policyId?: string | string[];
            transport: AlchemyTransport;
          }
        | Web3ChainConfig
      )[];
      transport?: never;
      // When providing multiple chains, then the signer connection is required
      signerConnection: ConnectionConfig;
      policyId?: never;
    }
  | {
      transport: AlchemyTransport;
      chain: Chain;
      policyId?: string | string[];
      signerConnection?: ConnectionConfig;
      chains?: never;
    };

type CreateStorageFn = (config?: {
  /** @deprecated Use `sessionConfig` to define session length instead. */
  sessionLength?: number;
  domain?: string;
}) => Storage;

export type AlchemyClientState = StoredState;

export type AlchemySigner = AlchemyWebSigner | RNAlchemySigner;

export type AlchemySignerClient = (AlchemyWebSigner | RNSignerClient) & {};

export type BaseCreateConfigProps = RpcConnectionConfig & {
  sessionConfig?: AlchemySignerParams["sessionConfig"] & { domain?: string };
  /**
   * Enable this parameter if you are using the config in an SSR setting (eg. NextJS)
   * Turing this setting on will disable automatic hydration of the client store
   */
  ssr?: boolean;

  storage?: CreateStorageFn;

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

export type CreateConfigProps = BaseCreateConfigProps & {
  _internal?: {
    createSigner?: (config: ClientStoreConfig) => AlchemySigner;
  };
};
