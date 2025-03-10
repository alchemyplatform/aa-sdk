import type { NoUndefined } from "@aa-sdk/core";
import { alchemy, createAlchemyPublicRpcClient } from "@account-kit/infra";
import {
  AlchemySignerStatus,
  AlchemyWebSigner,
  type ErrorInfo,
} from "@account-kit/signer";
import type { Chain } from "viem";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { DEFAULT_IFRAME_CONTAINER_ID } from "../createConfig.js";
import type { Connection, SupportedAccountTypes } from "../types.js";
import { storeReplacer } from "../utils/replacer.js";
import { storeReviver } from "../utils/reviver.js";
import {
  DEFAULT_STORAGE_KEY,
  type AccountState,
  type ClientStoreConfig,
  type CreateAccountKitStoreParams,
  type SignerStatus,
  type Store,
  type StoreState,
} from "./types.js";

export const STORAGE_VERSION = 14;

export const createAccountKitStore = (
  params: CreateAccountKitStoreParams
): Store => {
  const {
    connections,
    storage = typeof window !== "undefined" ? localStorage : undefined,
    ssr,
  } = params;

  // State defined in here should work either on the server or on the client
  // bundler client for example can be used in either setting to make RPC calls
  const store = createStore(
    subscribeWithSelector(
      storage
        ? persist(() => createInitialStoreState(params), {
            name: DEFAULT_STORAGE_KEY,
            storage: createJSONStorage<StoreState>(() => storage, {
              replacer: (key, value) => {
                if (key === "bundlerClient") return undefined;

                if (key === "user") {
                  const user = value as StoreState["user"];
                  if (!user) return undefined;

                  return {
                    address: user.address,
                    orgId: user.orgId,
                    userId: user.userId,
                    email: user.email,
                  } as StoreState["user"];
                }

                if (key === "chain") {
                  return { id: (value as Chain).id };
                }

                if (key === "smartAccountClients") {
                  return undefined;
                }

                return storeReplacer(key, value);
              },
              reviver: (key, value) => {
                if (key === "chain") {
                  return connections.find(
                    (c) => c.chain.id === (value as { id: number }).id
                  )?.chain;
                }

                return storeReviver(key, value);
              },
            }),
            migrate: (persisted, version) => {
              if (version < STORAGE_VERSION) {
                return createInitialStoreState(params);
              }

              return persisted as StoreState;
            },
            merge: (persisted, current) => {
              const persistedState = persisted as StoreState;
              if (persistedState.chain == null) {
                return createInitialStoreState(params);
              }

              const connectionsMap = createConnectionsMap(connections);
              if (!connectionsMap.has(persistedState.chain.id)) {
                return createInitialStoreState(params);
              }

              // simple check to ensure the same chains are present
              if (persistedState.connections.size !== connectionsMap.size) {
                return createInitialStoreState(params);
              }

              // check if all of the connections in the config match the persisted connections
              if (
                !connections.every(
                  (c) =>
                    persistedState.connections.has(c.chain.id) &&
                    deepEquals(persistedState.connections.get(c.chain.id), c)
                )
              ) {
                return createInitialStoreState(params);
              }

              return {
                // this is the default merge behavior
                ...current,
                ...persistedState,
                smartAccountClients: createEmptySmartAccountClientState(
                  connections.map((c) => c.chain)
                ),
                connections: connectionsMap,
                bundlerClient: createAlchemyPublicRpcClient({
                  chain: persistedState.chain,
                  transport: alchemy(
                    persistedState.connections.get(persistedState.chain.id)!
                      .transport
                  ),
                }),
              };
            },
            skipHydration: ssr,
            partialize: (state) => {
              const { signer, accounts, ...writeableState } = state;
              return writeableState;
            },
            version: STORAGE_VERSION,
          })
        : () => createInitialStoreState(params)
    )
  );

  addClientSideStoreListeners(store);

  return store;
};

const createInitialStoreState = (
  params: CreateAccountKitStoreParams
): StoreState => {
  const { connections, chain, client, sessionConfig } = params;
  const connectionMap = createConnectionsMap(connections);

  if (!connectionMap.has(chain.id)) {
    throw new Error("Chain not found in connections");
  }

  const chains = connections.map((c) => c.chain);
  const accountConfigs = createEmptyAccountConfigState(chains);
  const baseState: StoreState = {
    bundlerClient: createAlchemyPublicRpcClient({
      chain,
      transport: alchemy(connectionMap.get(chain.id)!.transport),
    }),
    chain,
    connections: connectionMap,
    accountConfigs,
    config: { client, sessionConfig },
    signerStatus: convertSignerStatusToState(
      AlchemySignerStatus.INITIALIZING,
      undefined
    ),
    smartAccountClients: createEmptySmartAccountClientState(chains),
  };

  if (typeof window === "undefined") {
    return baseState;
  }

  const accounts = createDefaultAccountState(chains);

  return {
    ...baseState,
    accounts,
  };
};

const createConnectionsMap = (connections: Connection[]) => {
  return connections.reduce((acc, connection) => {
    acc.set(connection.chain.id, connection);
    return acc;
  }, new Map<number, Connection>());
};

/**
 * Given initial client store parameters, it initializes an AlchemySigner instance.
 * This should only be called on the client.
 *
 * @param {CreateClientStoreParams} params to configure and create the signer
 * @returns {AlchemySigner} an instance of the AlchemySigner
 */
export const createSigner = (params: ClientStoreConfig) => {
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

  const signer = new AlchemyWebSigner({
    client: {
      ...client,
      iframeConfig: {
        ...client.iframeConfig,
        iframeContainerId,
      },
    },
    sessionConfig,
  });

  if (client.enablePopupOauth) {
    signer.preparePopupOauth();
  }

  return signer;
};

const AUTHENTICATING_STATUSES: AlchemySignerStatus[] = [
  AlchemySignerStatus.AUTHENTICATING_EMAIL,
  AlchemySignerStatus.AUTHENTICATING_OAUTH,
  AlchemySignerStatus.AUTHENTICATING_PASSKEY,
  AlchemySignerStatus.AWAITING_EMAIL_AUTH,
  AlchemySignerStatus.AWAITING_OTP_AUTH,
];

/**
 * Converts the AlchemySigner's status to a more readable object
 *
 * @param {AlchemySignerStatus} alchemySignerStatus Enum value of the AlchemySigner's status to convert
 * @param {ErrorInfo | undefined} error the current signer error, if present
 * @returns {SignerStatus} an object containing the original status as well as booleans to check the current state
 */
export const convertSignerStatusToState = (
  alchemySignerStatus: AlchemySignerStatus,
  error: ErrorInfo | undefined
): SignerStatus => ({
  status: alchemySignerStatus,
  error,
  isInitializing: alchemySignerStatus === AlchemySignerStatus.INITIALIZING,
  isAuthenticating: AUTHENTICATING_STATUSES.includes(alchemySignerStatus),
  isConnected: alchemySignerStatus === AlchemySignerStatus.CONNECTED,
  isDisconnected: alchemySignerStatus === AlchemySignerStatus.DISCONNECTED,
});

// This is done this way to avoid issues with React requiring static state
const staticState: AccountState<SupportedAccountTypes> = {
  status: "DISCONNECTED",
  account: undefined,
};

/**
 * Returns the default state for an account of a supported type.
 *
 * @example
 * ```ts
 * import { defaultAccountState } from "@account-kit/core";
 *
 * const defaultLightAccountState = defaultAccountState<"LightAccount">();
 * ```
 *
 * @template T
 * @returns {AccountState<T>} The default state for the specified account type
 */
export const defaultAccountState = <
  T extends SupportedAccountTypes
>(): AccountState<T> => staticState;

const addClientSideStoreListeners = (store: Store) => {
  if (typeof window === "undefined") {
    return;
  }

  store.subscribe(
    ({ signer }) => signer,
    (signer) => {
      if (!signer) return;
      signer.on("statusChanged", (status) => {
        store.setState((state) => ({
          signerStatus: convertSignerStatusToState(
            status,
            state.signerStatus.error
          ),
        }));
      });

      // TODO: handle this appropriately, see https://github.com/alchemyplatform/aa-sdk/pull/1140#discussion_r1837265706
      // signer.on("newUserSignup", () => console.log("got new user signup"));

      signer.on("connected", (user) => store.setState({ user }));

      signer.on("disconnected", () => {
        const chains = [...store.getState().connections.values()].map(
          (c) => c.chain
        );
        store.setState({
          user: undefined,
          accountConfigs: createEmptyAccountConfigState(chains),
          accounts: createDefaultAccountState(chains),
        });
      });

      signer.on("errorChanged", (error) =>
        store.setState((state) => ({
          signerStatus: convertSignerStatusToState(
            state.signerStatus.status,
            error
          ),
        }))
      );
    },
    { fireImmediately: true }
  );
};

const createEmptyAccountConfigState = (chains: Chain[]) => {
  return chains.reduce((acc, chain) => {
    acc[chain.id] = {};
    return acc;
  }, {} as StoreState["accountConfigs"]);
};

/**
 * Creates the default account state for the given chains.
 *
 * @param {Chain[]} chains The chains to create the account state for
 * @returns {NoUndefined<StoreState["accounts"]>} The default account state for the given chains
 */
export const createDefaultAccountState = (chains: Chain[]) => {
  return chains.reduce((acc, chain) => {
    acc[chain.id] = {
      LightAccount: defaultAccountState<"LightAccount">(),
      MultiOwnerModularAccount:
        defaultAccountState<"MultiOwnerModularAccount">(),
      MultiOwnerLightAccount: defaultAccountState<"MultiOwnerLightAccount">(),
      ModularAccountV2: defaultAccountState<"ModularAccountV2">(),
    };
    return acc;
  }, {} as NoUndefined<StoreState["accounts"]>);
};

export const createEmptySmartAccountClientState = (chains: Chain[]) => {
  return chains.reduce((acc, chain) => {
    acc[chain.id] = {};

    return acc;
  }, {} as StoreState["smartAccountClients"]);
};

const deepEquals = (obj1: any, obj2: any) => {
  if (typeof obj1 !== typeof obj2) return false;
  if (typeof obj1 !== "object") return obj1 === obj2;
  if (obj1 === null && obj2 === null) return true;
  if (obj1 === null || obj2 === null) return false;
  if (obj1.length !== obj2.length) return false;

  for (const key in obj1) {
    if (!deepEquals(obj1[key], obj2[key])) return false;
  }

  return true;
};
