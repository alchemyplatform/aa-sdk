import { ConnectionConfigSchema } from "@alchemy/aa-core";
import { DEFAULT_SESSION_MS } from "../signer/session/manager.js";
import { createClientStore } from "./store/client.js";
import { createCoreStore } from "./store/core.js";
import type { AlchemyAccountsConfig, CreateConfigProps } from "./types";

export const DEFAULT_IFRAME_CONTAINER_ID = "alchemy-signer-iframe-container";

export const createConfig = ({
  chain,
  iframeConfig,
  rootOrgId,
  rpId,
  sessionConfig,
  signerConnection,
  ssr,
  storage,
  ...connectionConfig
}: CreateConfigProps): AlchemyAccountsConfig => {
  const connection = ConnectionConfigSchema.parse(connectionConfig);

  const config: AlchemyAccountsConfig = {
    coreStore: createCoreStore({ connection, chain }),
    clientStore: createClientStore({
      client: {
        connection: signerConnection ?? connection,
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
    }),
    _internal: {
      ssr,
      storageKey: "alchemy-account-state",
      sessionLength: sessionConfig?.expirationTimeMs ?? DEFAULT_SESSION_MS,
    },
  };

  return config;
};
