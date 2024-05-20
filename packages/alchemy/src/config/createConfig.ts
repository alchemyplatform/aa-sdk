import { ConnectionConfigSchema } from "@alchemy/aa-core";
import { createStorage, createConfig as createWagmiConfig } from "@wagmi/core";
import { DEFAULT_SESSION_MS } from "../signer/session/manager.js";
import { createClientStore } from "./store/client.js";
import { createCoreStore } from "./store/core.js";
import { DEFAULT_STORAGE_KEY } from "./store/types.js";
import type {
  AlchemyAccountsConfig,
  Connection,
  CreateConfigProps,
} from "./types";

export const DEFAULT_IFRAME_CONTAINER_ID = "alchemy-signer-iframe-container";

/**
 * Creates an AlchemyAccountsConfig object that can be used in conjunction with
 * the actions exported from `@alchemy/aa-alchemy/config`.
 *
 * The config contains core and client stores that can be used to manage account state
 * in your application.
 *
 * @param params {@link CreateConfigProps} to use for creating an alchemy account config
 * @returns an alchemy account config object containing the core and client store
 */
export const createConfig = (
  params: CreateConfigProps
): AlchemyAccountsConfig => {
  const {
    chain,
    iframeConfig,
    rootOrgId,
    rpId,
    sessionConfig,
    signerConnection,
    ssr,
    storage,
    connectors,
    ...connectionConfig
  } = params;

  const connections: Connection[] = [];
  if (connectionConfig.connections != null) {
    connectionConfig.connections.forEach(({ chain, ...config }) => {
      connections.push({
        ...ConnectionConfigSchema.parse(config),
        chain,
      });
    });
  } else {
    connections.push({
      ...ConnectionConfigSchema.parse(connectionConfig),
      chain,
    });
  }

  const coreStore = createCoreStore({
    connections,
    chain,
    storage: storage?.(),
    ssr,
  });

  const clientStore = createClientStore({
    client: {
      connection: signerConnection ?? connections[0],
      iframeConfig,
      rootOrgId,
      rpId,
    },
    sessionConfig,
    storage: storage?.(
      sessionConfig?.expirationTimeMs
        ? { sessionLength: sessionConfig.expirationTimeMs }
        : undefined
    ),
    // TODO: this is duplicated from the core store
    chains: connections.map((x) => x.chain),
    ssr,
  });

  const wagmiConfig = createWagmiConfig({
    connectors,
    chains: [chain, ...connections.map((c) => c.chain)],
    client: () => config.coreStore.getState().bundlerClient,
    storage: createStorage({
      key: `${DEFAULT_STORAGE_KEY}:wagmi`,
      storage: storage
        ? storage()
        : typeof window !== "undefined"
        ? localStorage
        : undefined,
    }),
    ssr,
  });

  const config: AlchemyAccountsConfig = {
    coreStore,
    clientStore,
    _internal: {
      ssr,
      wagmiConfig,
      storageKey: "alchemy-account-state",
      sessionLength: sessionConfig?.expirationTimeMs ?? DEFAULT_SESSION_MS,
    },
  };

  return config;
};
