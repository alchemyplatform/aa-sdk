import { ConnectionConfigSchema } from "@aa-sdk/core";
import { DEFAULT_SESSION_MS } from "@account-kit/signer";
import { createStorage, createConfig as createWagmiConfig } from "@wagmi/core";
import { DEFAULT_STORAGE_KEY } from "./store/types.js";
import type {
  AlchemyAccountsConfig,
  Connection,
  CreateConfigProps,
} from "./types.js";
import { createAccountKitStore } from "./store/store.js";

export const DEFAULT_IFRAME_CONTAINER_ID = "alchemy-signer-iframe-container";

/**
 * Creates an AlchemyAccountsConfig object that can be used in conjunction with
 * the actions exported from `@account-kit/core`.
 *
 * The config contains core and client stores that can be used to manage account state
 * in your application.
 *
 * @example
 * ```ts
 * import { createConfig } from "@account-kit/core";
 * import { sepolia } from "@account-kit/infra";
 *
 * const config = createConfig({
 *  chain: sepolia,
 *  apiKey: "your-api-key",
 * });
 * ```
 *
 * @param {CreateConfigProps} params The parameters to create the config with
 * @returns {AlchemyAccountsConfig} An alchemy account config object containing the core and client store
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

  const store = createAccountKitStore({
    connections,
    chain,
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
    ssr,
  });

  const wagmiConfig = createWagmiConfig({
    connectors,
    chains: [chain, ...connections.map((c) => c.chain)],
    client: () => config.store.getState().bundlerClient,
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
    store: store,
    _internal: {
      ssr,
      wagmiConfig,
      storageKey: "alchemy-account-state",
      sessionLength: sessionConfig?.expirationTimeMs ?? DEFAULT_SESSION_MS,
    },
  };

  return config;
};
