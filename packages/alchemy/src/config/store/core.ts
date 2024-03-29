import { type ConnectionConfig } from "@alchemy/aa-core";
import type { Chain } from "viem";
import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { createAlchemyPublicRpcClient } from "../../client/rpcClient.js";

export type CreateCoreStoreParams = {
  connection: ConnectionConfig;
  chain: Chain;
};

export const createCoreStore = ({
  connection,
  chain,
}: CreateCoreStoreParams) => {
  const bundlerClient = createAlchemyPublicRpcClient({
    chain,
    connectionConfig: connection,
  });

  // State defined in here should work either on the server or on the client
  // bundler client for example can be used in either setting to make RPC calls
  const coreStore = createStore(
    subscribeWithSelector(() => ({
      bundlerClient,
    }))
  );

  return coreStore;
};
