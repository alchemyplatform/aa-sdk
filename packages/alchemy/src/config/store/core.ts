import type { Chain } from "viem";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { createAlchemyPublicRpcClient } from "../../client/rpcClient.js";
import type { Connection } from "../types.js";
import { bigintMapReplacer } from "../utils/replacer.js";
import { bigintMapReviver } from "../utils/reviver.js";
import {
  DEFAULT_STORAGE_KEY,
  type CoreState,
  type CoreStore,
} from "./types.js";

export type CreateCoreStoreParams = {
  connections: Connection[];
  chain: Chain;
  storage?: Storage;
  ssr?: boolean;
};

/**
 * Create the core store for alchemy accounts. This store contains the bundler client
 * as well as the chain configs (including the initial chain to use)
 *
 * @param params connections configs
 * @param params.connections a collection of chains and their connection configs
 * @param params.chain the initial chain to use
 * @param params.storage the storage to use for persisting the state
 * @param params.ssr whether the store is being created on the server
 * @returns the core store
 */
export const createCoreStore = (params: CreateCoreStoreParams): CoreStore => {
  const {
    connections,
    chain,
    storage = typeof window !== "undefined" ? localStorage : undefined,
    ssr,
  } = params;

  // State defined in here should work either on the server or on the client
  // bundler client for example can be used in either setting to make RPC calls
  const coreStore = createStore(
    subscribeWithSelector(
      storage
        ? persist(() => createInitialCoreState(connections, chain), {
            name: `${DEFAULT_STORAGE_KEY}:core`,
            storage: createJSONStorage<CoreState>(() => storage, {
              replacer: (key, value) => {
                if (key === "bundlerClient") {
                  const client = value as CoreState["bundlerClient"];
                  return {
                    connection: connections.find(
                      (x) => x.chain.id === client.chain.id
                    ),
                  };
                }
                return bigintMapReplacer(key, value);
              },
              reviver: (key, value) => {
                if (key === "bundlerClient") {
                  const connection = value as Connection;
                  return createAlchemyPublicRpcClient({
                    chain: connection.chain,
                    connectionConfig: connection,
                  });
                }

                return bigintMapReviver(key, value);
              },
            }),
            version: 1,
            skipHydration: ssr,
          })
        : () => createInitialCoreState(connections, chain)
    )
  );

  return coreStore;
};

const createInitialCoreState = (
  connections: Connection[],
  chain: Chain
): CoreState => {
  const connectionMap = connections.reduce((acc, connection) => {
    acc.set(connection.chain.id, connection);
    return acc;
  }, new Map<number, Connection>());

  if (!connectionMap.has(chain.id)) {
    throw new Error("Chain not found in connections");
  }

  const bundlerClient = createAlchemyPublicRpcClient({
    chain,
    connectionConfig: connectionMap.get(chain.id)!,
  });

  return {
    bundlerClient,
    chain,
    connections: connectionMap,
  };
};
