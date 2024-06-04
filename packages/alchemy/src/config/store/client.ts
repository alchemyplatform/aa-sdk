import type { NoUndefined } from "@alchemy/aa-core";
import type { Chain } from "viem";
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
import { bigintMapReplacer } from "../utils/replacer.js";
import { bigintMapReviver } from "../utils/reviver.js";
import {
  DEFAULT_STORAGE_KEY,
  type AccountState,
  type ClientState,
  type ClientStore,
  type CreateClientStoreParams,
  type SignerStatus,
} from "./types.js";

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
            storage: createJSONStorage<ClientState>(() => storage, {
              replacer: bigintMapReplacer,
              reviver: bigintMapReviver,
            }),
            skipHydration: ssr,
            partialize: ({ signer, accounts, ...writeableState }) =>
              writeableState,
            version: 1,
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
  const accountConfigs = createEmptyAccountConfigState(params.chains);
  const baseState = {
    accountConfigs,
    config: params,
    signerStatus: convertSignerStatusToState(AlchemySignerStatus.INITIALIZING),
  };

  if (typeof window === "undefined") {
    return baseState;
  }

  const accounts = createDefaultAccountState(params.chains);
  return {
    accounts,
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
          accountConfigs: createEmptyAccountConfigState(
            store.getState().config.chains
          ),
          accounts: createDefaultAccountState(store.getState().config.chains),
        });
      });
    },
    { fireImmediately: true }
  );
};

const createEmptyAccountConfigState = (chains: Chain[]) => {
  return chains.reduce((acc, chain) => {
    acc[chain.id] = {};
    return acc;
  }, {} as ClientState["accountConfigs"]);
};

export const createDefaultAccountState = (chains: Chain[]) => {
  return chains.reduce((acc, chain) => {
    acc[chain.id] = {
      LightAccount: defaultAccountState<"LightAccount">(),
      MultiOwnerModularAccount:
        defaultAccountState<"MultiOwnerModularAccount">(),
    };
    return acc;
  }, {} as NoUndefined<ClientState["accounts"]>);
};
