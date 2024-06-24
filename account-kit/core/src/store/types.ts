import type { ClientWithAlchemyMethods } from "@account-kit/infra";
import type {
  AlchemySignerParams,
  AlchemySignerStatus,
  AlchemySignerWebClient,
  AlchemyWebSigner,
  User,
} from "@account-kit/signer";
import type { State as WagmiState } from "@wagmi/core";
import type { Address, Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { Mutate, StoreApi } from "zustand/vanilla";
import type { AccountConfig } from "../actions/createAccount";
import type {
  Connection,
  SupportedAccount,
  SupportedAccountTypes,
} from "../types";

export const DEFAULT_STORAGE_KEY = "alchemy-account-state";

export type AccountState<TAccount extends SupportedAccountTypes> =
  | {
      status: "INITIALIZING";
      account: Promise<SupportedAccount<TAccount>>;
    }
  | {
      status: "RECONNECTING";
      account: {
        address: Address;
      };
    }
  | {
      status: "READY";
      account: SupportedAccount<TAccount>;
    }
  | { status: "DISCONNECTED"; account: undefined }
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
  isInitializing: boolean;
  isAuthenticating: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
};

export type StoredState =
  | Omit<StoreState, "signer" | "accounts">
  | {
      alchemy: Omit<StoreState, "signer" | "accounts">;
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
  // getting this state should throw an error if not on the client
  signer?: AlchemyWebSigner;
  accounts?: {
    [chain: number]: {
      [key in SupportedAccountTypes]: AccountState<key>;
    };
  };
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
  bundlerClient: ClientWithAlchemyMethods;
  chain: Chain;
  connections: Map<number, Connection>;
};

export type Store = Mutate<
  StoreApi<StoreState>,
  [["zustand/subscribeWithSelector", never], ["zustand/persist", StoreState]]
>;
