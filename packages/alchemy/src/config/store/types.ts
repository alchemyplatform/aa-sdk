import type { Address } from "viem";
import type { PartialBy } from "viem/chains";
import type { Mutate, StoreApi } from "zustand/vanilla";
import type { ClientWithAlchemyMethods } from "../../client/types";
import type {
  AlchemySigner,
  AlchemySignerClient,
  AlchemySignerParams,
  AlchemySignerStatus,
  User,
} from "../../signer";
import type { AccountConfig } from "../actions/createAccount";
import type { SupportedAccount, SupportedAccountTypes } from "../types";

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
    Exclude<AlchemySignerParams["client"], AlchemySignerClient>,
    "iframeConfig"
  >;
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
  signer?: AlchemySigner;
  accounts?: {
    [key in SupportedAccountTypes]: AccountState<key>;
  };
  // serializable state
  // NOTE: in some cases this can be serialized to cookie storage
  // be mindful of how big this gets. cookie limit 4KB
  config: CreateClientStoreParams;
  accountConfigs: Partial<{
    [key in SupportedAccountTypes]: AccountConfig<key>;
  }>;
  user?: User;
  signerStatus: SignerStatus;
};

export type ClientStore = Mutate<
  StoreApi<ClientState>,
  [["zustand/subscribeWithSelector", never], ["zustand/persist", ClientState]]
>;

export type CoreState = { bundlerClient: ClientWithAlchemyMethods };

export type CoreStore = Mutate<
  StoreApi<CoreState>,
  [["zustand/subscribeWithSelector", never]]
>;
