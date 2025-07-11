import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import type {
  AlchemySignerParams,
  AlchemySignerStatus,
  AlchemySignerWebClient,
  ErrorInfo,
  User,
} from "@account-kit/signer";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import type { State as WagmiState } from "@wagmi/core";
import type { Address, Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { Mutate, StoreApi } from "zustand/vanilla";
import type { AccountConfig } from "../actions/createAccount";
import type { GetSmartAccountClientResult } from "../actions/getSmartAccountClient";
import type {
  AlchemySigner,
  Connection,
  SolanaConnection,
  SupportedAccount,
  SupportedAccountTypes,
} from "../types";

export const DEFAULT_STORAGE_KEY = "alchemy-account-state";

export type AccountState<TAccount extends SupportedAccountTypes> =
  | {
      status: "INITIALIZING";
      account: Promise<SupportedAccount<TAccount>>;
      error?: never;
    }
  | {
      status: "RECONNECTING";
      account: {
        address: Address;
      };
      error?: never;
    }
  | {
      status: "READY";
      account: SupportedAccount<TAccount>;
      error?: never;
    }
  | { status: "DISCONNECTED"; account: undefined; error?: never }
  | { status: "ERROR"; account: undefined; error: Error };

export type ClientStoreConfig = {
  client: PartialBy<
    Exclude<AlchemySignerParams["client"], AlchemySignerWebClient>,
    "iframeConfig"
  >;
  sessionConfig?: AlchemySignerParams["sessionConfig"];
};

export type SignerStatus = {
  status: AlchemySignerStatus;
  error?: ErrorInfo;
  isInitializing: boolean;
  isAuthenticating: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
};

export type StoredState = {
  alchemy: Omit<StoreState, "signer" | "accounts" | "bundlerClient">;
  wagmi?: WagmiState;
};

export type CreateAccountKitStoreParams = ClientStoreConfig & {
  connections: Connection[];
  chain: Chain;
  client: PartialBy<
    Exclude<AlchemySignerParams["client"], AlchemySignerWebClient>,
    "iframeConfig"
  >;
  sessionConfig?: AlchemySignerParams["sessionConfig"];
  storage?: Storage;
  ssr?: boolean;
  solana?: SolanaConnection;
};

export type StoreState = {
  // non-serializable
  signer?: AlchemySigner;
  accounts?: {
    [chain: number]: {
      [key in SupportedAccountTypes]: AccountState<key>;
    };
  };
  smartAccountClients: {
    [chain: number]: Partial<{
      [key in SupportedAccountTypes]: GetSmartAccountClientResult<
        Chain,
        SupportedAccount<key>
      >;
    }>;
  };
  smartWalletClients: {
    [chain: number]: SmartWalletClient | undefined;
  };
  bundlerClient: ClientWithAlchemyMethods;
  // serializable state
  // NOTE: in some cases this can be serialized to cookie storage
  // be mindful of how big this gets. cookie limit 4KB
  config: ClientStoreConfig;
  accountConfigs: {
    [chain: number]: Partial<{
      [key in SupportedAccountTypes]: AccountConfig<key>;
    }>;
  };
  user?: User;
  signerStatus: SignerStatus;
  chain: Chain;
  connections: Map<number | string, Connection>;
  solana?: SolanaConnection;
};

type Expanded<T> = { [K in keyof T]: T[K] };

type Middleware = [
  ["zustand/subscribeWithSelector", never],
  ["zustand/persist", StoreState],
];

export type Store = Expanded<Mutate<StoreApi<StoreState>, Middleware>>;
