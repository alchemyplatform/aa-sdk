import type { ConnectionConfig } from "@aa-sdk/core";
import type {
  AlchemyTransport,
  AlchemyTransportConfig,
  PolicyToken,
} from "@account-kit/infra";
import type {
  RNAlchemySignerSingleton as RNAlchemySigner,
  RNSignerClient,
} from "@account-kit/react-native-signer";
import type {
  AlchemySignerParams,
  AlchemySignerWebClient,
  AlchemyWebSigner,
} from "@account-kit/signer";
import type {
  LightAccount,
  LightAccountVersion,
  ModularAccountV2,
  MultiOwnerLightAccount,
  MultiOwnerModularAccount,
} from "@account-kit/smart-contracts";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import type { Connection as SolanaWeb3Connection } from "@solana/web3.js";
import type { CreateConnectorFn } from "@wagmi/core";
import { type Config as WagmiConfig } from "@wagmi/core";
import type { Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { ClientStoreConfig, Store, StoredState } from "./store/types";
import type { WalletAdapter } from "@solana/wallet-adapter-base";

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
  accountCreationHint?: CreateConfigProps["accountCreationHint"];
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

export type SolanaConnection = {
  connection: SolanaWeb3Connection;
  policyId?: string;
  /**
   * Optional array of Solana wallet adapters to be used for connecting to wallets
   * These adapters will be made available in the React context for wallet selection
   *
   * @example
   * ```ts
   * import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
   *
   * const config = createConfig({
   *   // ... other config
   *   solana: {
   *     connection: solanaConnection,
   *     adapters: [
   *       new PhantomWalletAdapter(),
   *       new SolflareWalletAdapter(),
   *     ]
   *   }
   * });
   * ```
   */
  adapters?: WalletAdapter[];
};

export type Connection = {
  transport: AlchemyTransportConfig;
  chain: Chain;
  policyId?: string | string[];
  policyToken?: PolicyToken;
};

type RpcConnectionConfig =
  | {
      chain: Chain;
      chains: {
        chain: Chain;
        policyId?: string | string[];
        // optional transport override
        transport?: AlchemyTransport;
      }[];
      solana?: SolanaConnection;
      // optional global transport to use for all chains
      transport: AlchemyTransport;
      // When providing multiple chains and no default transport, the signer connection is required
      signerConnection?: ConnectionConfig;
      policyId?: never;
      policyToken?: never;
    }
  | {
      chain: Chain;
      chains: {
        chain: Chain;
        policyId?: string | string[];
        transport: AlchemyTransport;
      }[];
      solana?: SolanaConnection;
      transport?: never;
      // When providing multiple chains, then the signer connection is required
      signerConnection: ConnectionConfig;
      policyId?: never;
      policyToken?: never;
    }
  | {
      transport: AlchemyTransport;
      chain: Chain;
      solana?: SolanaConnection;
      policyId?: string | string[];
      policyToken?: PolicyToken;
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

  accountCreationHint?: NonNullable<
    Parameters<SmartWalletClient["requestAccount"]>[0]
  >["creationHint"];

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
