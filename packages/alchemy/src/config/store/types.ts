import type { Mutate, StoreApi } from "zustand";
import type { ClientWithAlchemyMethods } from "../../client/types";
import type { AlchemySigner, AlchemySignerStatus, User } from "../../signer";
import type { SupportedAccount, SupportedAccountTypes } from "../types";

export type AccountState<TAccount extends SupportedAccountTypes> =
  | {
      status: "INITIALIZING";
      account: Promise<SupportedAccount<TAccount>>;
    }
  | {
      status: "READY";
      account: SupportedAccount<TAccount>;
    }
  | { status: "DISCONNECTED"; account: undefined }
  | { status: "ERROR"; account: undefined; error: Error };

export type SignerStatus = {
  status: AlchemySignerStatus;
  isInitializing: boolean;
  isAuthenticating: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
};

export type ClientState = {
  signer: AlchemySigner;
  user?: User;
  signerStatus: SignerStatus;
  accounts: {
    [key in SupportedAccountTypes]: AccountState<key>;
  };
};

export type ClientStore =
  | Mutate<StoreApi<ClientState>, [["zustand/subscribeWithSelector", never]]>
  | undefined;

export type CoreState = { bundlerClient: ClientWithAlchemyMethods };

export type CoreStore = Mutate<
  StoreApi<CoreState>,
  [["zustand/subscribeWithSelector", never]]
>;
