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

export type CreateClientStoreParams = {
  client: PartialBy<
    Exclude<AlchemySignerParams["client"], AlchemySignerWebClient>,
    "iframeConfig"
  >;
  chains: Chain[];
  sessionConfig?: AlchemySignerParams["sessionConfig"];
  storage?: Storage;
  ssr?: boolean;
};

export type SignerStatus = {
  status: AlchemySignerStatus;
  isInitializing: boolean;
  isAuthenticating: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
};

export type ClientState = {
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
  config: CreateClientStoreParams;
  accountConfigs: {
    [chain: number]: Partial<{
      [key in SupportedAccountTypes]: AccountConfig<key>;
    }>;
  };
  user?: User;
  signerStatus: SignerStatus;
};

export type ClientStore = Mutate<
  StoreApi<ClientState>,
  [["zustand/subscribeWithSelector", never], ["zustand/persist", ClientState]]
>;

export type CoreState = {
  bundlerClient: ClientWithAlchemyMethods;
  chain: Chain;
  connections: Map<number, Connection>;
};

export type CoreStore = Mutate<
  StoreApi<CoreState>,
  [["zustand/subscribeWithSelector", never], ["zustand/persist", CoreState]]
>;

export type StoredState =
  | Omit<ClientState, "signer" | "accounts">
  | {
      alchemy: Omit<ClientState, "signer" | "accounts">;
      wagmi?: WagmiState;
    };
