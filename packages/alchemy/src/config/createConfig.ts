import { ConnectionConfigSchema } from "@alchemy/aa-core";
import { DEFAULT_SESSION_MS } from "../signer/session/manager.js";
import { createClientStore } from "./store/client.js";
import { createCoreStore } from "./store/core.js";
import type {
  AlchemyAccountsConfig,
  Connection,
  CreateConfigProps,
} from "./types";

export const DEFAULT_IFRAME_CONTAINER_ID = "alchemy-signer-iframe-container";

/**
 * Creates an AlchemyAccountsConfig object from the provided configuration params.
 * This method should be called in a static context as it creates state management
 * objects that are used by hooks (in React) or consumed by the core actions
 *
 * @param configProps see {@link CreateConfigProps} for the available configuration options
 * @returns an AlchemyAccountsConfig that can be used with the actions exported by this package
 */
export const createConfig = (
  configProps: CreateConfigProps
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
    ...connectionConfig
  } = configProps;
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

  const config: AlchemyAccountsConfig = {
    coreStore: createCoreStore({
      connections,
      chain,
      storage: storage?.(),
      ssr,
    }),
    clientStore: createClientStore({
      client: {
        connection: signerConnection ?? connections[0],
        iframeConfig,
        rootOrgId,
        rpId,
      },
      // TODO: this is duplicated from the core store
      chains: connections.map((x) => x.chain),
      sessionConfig,
      storage: storage?.(
        sessionConfig?.expirationTimeMs
          ? { sessionLength: sessionConfig.expirationTimeMs }
          : undefined
      ),
      ssr,
    }),
    _internal: {
      ssr,
      storageKey: "alchemy-account-state",
      sessionLength: sessionConfig?.expirationTimeMs ?? DEFAULT_SESSION_MS,
    },
  };

  return config;
};
