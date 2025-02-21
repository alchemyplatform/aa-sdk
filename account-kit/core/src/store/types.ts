import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import type {
  AlchemySignerParams,
  AlchemySignerStatus,
  AlchemySignerWebClient,
  AlchemyWebSigner,
  ErrorInfo,
  User,
} from "@account-kit/signer";
import type { State as WagmiState } from "@wagmi/core";
import type { Address, Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { Mutate, StoreApi } from "zustand/vanilla";
import type { AccountConfig } from "../actions/createAccount";
import type { GetSmartAccountClientResult } from "../actions/getSmartAccountClient";
import type {
  Connection,
  SupportedAccount,
  SupportedAccountModes,
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
};

export type StoreState = {
  // non-serializable
  signer?: AlchemyWebSigner;
  accounts?: {
    [chain: number]: {
      [T in SupportedAccountTypes]: {
        [M in SupportedAccountModes<T>]: AccountState<T>;
      };
    };
  };
  smartAccountClients: {
    [chain: number]: Partial<{
      [T in SupportedAccountTypes]: Partial<{
        [M in SupportedAccountModes<T>]: GetSmartAccountClientResult<
          Chain,
          SupportedAccount<T>
        >;
      }>;
    }>;
  };
  bundlerClient: ClientWithAlchemyMethods;
  // serializable state
  // NOTE: in some cases this can be serialized to cookie storage
  // be mindful of how big this gets. cookie limit 4KB
  config: ClientStoreConfig;
  accountConfigs: {
    [chain: number]: Partial<{
      [T in SupportedAccountTypes]: Partial<{
        [M in SupportedAccountModes<T>]: AccountConfig<T>;
      }>;
    }>;
  };
  user?: User;
  signerStatus: SignerStatus;
  chain: Chain;
  connections: Map<number, Connection>;
};

export type Store = Mutate<
  StoreApi<StoreState>,
  [["zustand/subscribeWithSelector", never], ["zustand/persist", StoreState]]
>;
