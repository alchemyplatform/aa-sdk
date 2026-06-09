import {
  alchemyTransport,
  resolveNetwork,
  type AlchemyTransportConfig,
  type NetworkInput,
} from "@alchemy/common";
import { createClient, type Chain, type Client } from "viem";
import { getRpcUrl } from "./internal/endpoints.js";
import { dataActions, type DataActions } from "./decorator.js";
import type { AlchemyTransport } from "@alchemy/common";

export type AlchemyDataClientOptions = Pick<
  AlchemyTransportConfig,
  "apiKey" | "jwt" | "url" | "fetchOptions"
> & {
  /**
   * Default network for network-scoped calls (NFT, Token, Transfers).
   * Accepts a viem Chain, an Alchemy slug ("eth-mainnet"), or CAIP-2
   * ("eip155:1"). Multi-network calls (Portfolio) take explicit networks
   * per request.
   */
  network?: NetworkInput;
};

export type AlchemyDataClient = Client<AlchemyTransport, Chain | undefined> &
  DataActions;

/**
 * Creates a Data API client. This is a convenience wrapper over
 * `createClient` + `alchemyTransport` + the {@link dataActions} decorator —
 * developers already holding a viem client with an Alchemy transport can use
 * `client.extend(dataActions)` instead and get the identical behavior.
 *
 * @example
 * ```ts
 * import { createAlchemyDataClient } from "@alchemy/data-apis";
 *
 * const data = createAlchemyDataClient({
 *   apiKey: process.env.ALCHEMY_API_KEY,
 *   network: "eth-mainnet", // or `mainnet` from viem/chains, or "eip155:1"
 * });
 *
 * const nfts = await data.nft.getNftsForOwner({ owner: "0x..." });
 * ```
 *
 * @param {AlchemyDataClientOptions} options Auth (apiKey/jwt/proxy url) and default network
 * @returns {AlchemyDataClient} A viem client extended with the Data API actions
 */
export function createAlchemyDataClient(
  options: AlchemyDataClientOptions,
): AlchemyDataClient {
  const { network, ...transportConfig } = options;

  // A viem Chain default flows through the transport's registry resolution
  // untouched. Slug/CAIP-2 defaults are carried on a minimal chain definition
  // (custom.alchemyNetwork) and the RPC URL is resolved up front — chain ID 0
  // mirrors how wallet-apis models Solana chains.
  const chain: Chain | undefined = (() => {
    if (network == null) return undefined;
    if (typeof network === "object") return network;
    const resolved = resolveNetwork(network);
    return {
      id: resolved.chainId ?? 0,
      name: resolved.slug,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [] } },
      custom: { alchemyNetwork: resolved.slug },
    };
  })();

  const transport = alchemyTransport({
    ...transportConfig,
    ...(chain && chain.custom?.alchemyNetwork && !transportConfig.url
      ? { url: getRpcUrl(chain.custom.alchemyNetwork as string) }
      : {}),
  });

  return createClient({ chain, transport }).extend(dataActions);
}
