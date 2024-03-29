"use client";

import { ConnectionConfigSchema } from "@alchemy/aa-core";
import { getBundlerClient } from "./actions/getBundlerClient.js";
import { getSigner } from "./actions/getSigner.js";
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
    }),
    // these are just here for convenience right now, but you can do all of this with actions on the stores as well
    get bundlerClient() {
      return getBundlerClient(config);
    },
    get signer() {
      return getSigner(config);
    },
  };

  return config;
};
