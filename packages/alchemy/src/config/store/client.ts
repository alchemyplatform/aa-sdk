import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { AlchemySigner } from "../../signer/signer.js";
import { AlchemySignerStatus } from "../../signer/types.js";
import { DEFAULT_IFRAME_CONTAINER_ID } from "../createConfig.js";
import type { SupportedAccountTypes } from "../types.js";
import type {
  AccountState,
  ClientState,
  ClientStore,
  CreateClientStoreParams,
  SignerStatus,
} from "./types.js";

export const DEFAULT_STORAGE_KEY = "alchemy-account-state";

/**
 * Creates a zustand store instance containing the client only state
 *
 * @param config the configuration object for the client store
 * @returns a zustand store instance that maintains the client state
 */
export const createClientStore = (config: CreateClientStoreParams) => {
  const {
    storage = typeof window !== "undefined" ? localStorage : undefined,
    ssr,
  } = config;

  const clientStore = createStore(
    subscribeWithSelector(
      storage
        ? persist(() => createInitialClientState(config), {
            name: DEFAULT_STORAGE_KEY,
            storage: createJSONStorage<ClientState>(() => storage),
            skipHydration: ssr,
            partialize: ({ signer, accounts, ...writeableState }) =>
              writeableState,
          })
        : () => createInitialClientState(config)
    )
  );

  addClientSideStoreListeners(clientStore);

  return clientStore;
};

/**
 * Given initial client store parameters, it initializes an AlchemySigner instance.
 * This should only be called on the client.
 *
 * @param params {@link CreateClientStoreParams} to configure and create the signer
 * @returns an instance of the {@link AlchemySigner}
 */
export const createSigner = (params: CreateClientStoreParams) => {
  const { client, sessionConfig } = params;
  const { iframeContainerId } = client.iframeConfig ?? {
    iframeContainerId: DEFAULT_IFRAME_CONTAINER_ID,
  };

  let iframeContainer = document.getElementById(iframeContainerId);
  if (iframeContainer !== null) {
    iframeContainer.innerHTML = "";
    iframeContainer.style.display = "none";
  } else {
    iframeContainer = document.createElement("div");
    iframeContainer.id = iframeContainerId;
    iframeContainer.style.display = "none";
    document.body.appendChild(iframeContainer);
  }

  const signer = new AlchemySigner({
    client: {
      ...client,
      iframeConfig: {
        ...client.iframeConfig,
        iframeContainerId,
      },
    },
    sessionConfig,
  });

  const search = new URLSearchParams(window.location.search);
  if (search.has("bundle")) {
    signer.authenticate({ type: "email", bundle: search.get("bundle")! });
  }

  return signer;
};

/**
 * Converts the AlchemySigner's status to a more readable object
 *
 * @param alchemySignerStatus Enum value of the AlchemySigner's status to convert
 * @returns an object containing the original status as well as booleans to check the current state
 */
export const convertSignerStatusToState = (
  alchemySignerStatus: AlchemySignerStatus
): SignerStatus => ({
  status: alchemySignerStatus,
  isInitializing: alchemySignerStatus === AlchemySignerStatus.INITIALIZING,
  isAuthenticating:
    alchemySignerStatus === AlchemySignerStatus.AUTHENTICATING ||
    alchemySignerStatus === AlchemySignerStatus.AWAITING_EMAIL_AUTH,
  isConnected: alchemySignerStatus === AlchemySignerStatus.CONNECTED,
  isDisconnected: alchemySignerStatus === AlchemySignerStatus.DISCONNECTED,
});

// This is done this way to avoid issues with React requiring static state
const staticState: AccountState<SupportedAccountTypes> = {
  status: "DISCONNECTED",
  account: undefined,
};

export const defaultAccountState = <
  T extends SupportedAccountTypes
>(): AccountState<T> => staticState;

const createInitialClientState = (
  params: CreateClientStoreParams
): ClientState => {
  const baseState = {
    accountConfigs: {
      LightAccount: undefined,
      MultiOwnerModularAccount: undefined,
    },
    config: params,
    signerStatus: convertSignerStatusToState(AlchemySignerStatus.INITIALIZING),
  };

  if (typeof window === "undefined") {
    return baseState;
  }

  return {
    // signer: createSigner(params),
    accounts: {
      LightAccount: defaultAccountState<"LightAccount">(),
      MultiOwnerModularAccount:
        defaultAccountState<"MultiOwnerModularAccount">(),
    },
    ...baseState,
  };
};

const addClientSideStoreListeners = (store: ClientStore) => {
  if (typeof window === "undefined") {
    return;
  }

  store.subscribe(
    ({ signer }) => signer,
    (signer) => {
      if (!signer) return;
      signer.on("statusChanged", (status) => {
        store.setState({ signerStatus: convertSignerStatusToState(status) });
      });

      signer.on("connected", (user) => store.setState({ user }));

      signer.on("disconnected", () => {
        store.setState({
          user: undefined,
          accountConfigs: {
            LightAccount: undefined,
            MultiOwnerModularAccount: undefined,
          },
          accounts: {
            LightAccount: { status: "DISCONNECTED", account: undefined },
            MultiOwnerModularAccount: {
              status: "DISCONNECTED",
              account: undefined,
            },
          },
        });
      });
    },
    { fireImmediately: true }
  );
};
