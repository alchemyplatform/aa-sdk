import {
  Chain,
  HttpTransport,
  HttpTransportConfig,
  createClient,
  http,
  publicActions,
} from "viem";
import { alchemyEnhancedApiActions } from "./actions.js";
import { AlchemyEnhancedApiClient } from "./types-client.js";

export const createAlchemyEnhancedApiClient = ({
  chain,
  rpcUrl,
  fetchOptions,
}: {
  chain: Chain;
  rpcUrl: string;
  fetchOptions?: HttpTransportConfig["fetchOptions"];
}): AlchemyEnhancedApiClient<HttpTransport> =>
  createClient({
    chain,
    transport: http(rpcUrl, {
      fetchOptions: {
        ...fetchOptions,
        headers: {
          ...fetchOptions?.headers,
        },
      },
    }),
    key: "alchemy-enhanced-api",
    name: "Alchemy Enhanced API Client",
    type: "alchemyEnhancedApiClient",
  }).extend((clientAdapter) => ({
    ...publicActions(clientAdapter),
    ...alchemyEnhancedApiActions(clientAdapter),
  }));
