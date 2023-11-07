import {
  Chain,
  CustomTransport,
  HttpTransportConfig,
  createClient,
  publicActions,
} from "viem";
import { alchemyEnhancedApiActions } from "./actions.js";
import { customTransport } from "./transport.js";
import { AlchemyEnhancedApiClient } from "./types-client.js";

export const createAlchemyEnhancedApiClient = ({
  chain,
  rpcUrl,
  fetchOptions,
}: {
  chain: Chain;
  rpcUrl: string;
  fetchOptions?: HttpTransportConfig["fetchOptions"];
}): AlchemyEnhancedApiClient<CustomTransport> =>
  createClient({
    chain,
    transport: customTransport(chain, rpcUrl, fetchOptions),
    key: "alchemy-enhanced-api",
    name: "Alchemy Enhanced API Client",
    type: "alchemyEnhancedApiClient",
  }).extend((clientAdapter) => ({
    ...publicActions(clientAdapter),
    ...alchemyEnhancedApiActions(clientAdapter),
  }));
