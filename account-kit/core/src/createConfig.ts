import { DEFAULT_SESSION_MS } from "@account-kit/signer";
import { createStorage, createConfig as createWagmiConfig } from "@wagmi/core";
import { getBundlerClient } from "./actions/getBundlerClient.js";
import { CoreLogger } from "./metrics.js";
import { createAccountKitStore } from "./store/store.js";
import { DEFAULT_STORAGE_KEY } from "./store/types.js";
import type {
  AlchemyAccountsConfig,
  AlchemySigner,
  Connection,
  CreateConfigProps,
} from "./types.js";

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
 *  transport: alchemy({ apiKey: "your-api-key" }),
 * });
 * ```
 *
 * @param {CreateConfigProps} params The parameters to create the config with
 * @returns {AlchemyAccountsConfig} An alchemy account config object containing the core and client store
 */
export const createConfig = <T extends AlchemySigner>(
  params: CreateConfigProps
): AlchemyAccountsConfig<T> => {
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
    oauthCallbackUrl,
    enablePopupOauth,
    ...connectionConfig
  } = params;

  const connections: Connection[] = [];
  if (connectionConfig.chains == null) {
    connections.push({
      transport: connectionConfig.transport.config,
      policyId: connectionConfig.policyId,
      chain,
    });
  } else {
    connectionConfig.chains.forEach(({ chain, policyId, transport }) => {
      connections.push({
        transport: transport?.config ?? connectionConfig.transport!.config,
        chain,
        policyId,
      });
    });
  }

  const defaultConnection = connections[0].transport;
  const store = createAccountKitStore<T>({
    connections,
    chain,
    client: {
      connection:
        signerConnection ??
        defaultConnection.alchemyConnection ??
        defaultConnection,
      iframeConfig,
      rootOrgId,
      rpId,
      oauthCallbackUrl,
      enablePopupOauth,
    },
    sessionConfig,
    storage: storage?.(
      sessionConfig
        ? {
            domain: sessionConfig.domain,
          }
        : undefined
    ),
    ssr,
  });

  const wagmiConfig = createWagmiConfig({
    connectors,
    chains: [chain, ...connections.map((c) => c.chain)],
    client: () => getBundlerClient(config),
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

  const config: AlchemyAccountsConfig<T> = {
    store: store,
    _internal: {
      ssr,
      wagmiConfig,
      storageKey: "alchemy-account-state",
      sessionLength: sessionConfig?.expirationTimeMs ?? DEFAULT_SESSION_MS,
    },
  };

  CoreLogger.trackEvent({
    name: "config_created",
    data: {
      ssr: ssr ?? false,
      chainIds: connections.map((x) => x.chain.id),
    },
  });

  return config;
};
