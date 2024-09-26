import { createBundlerClient } from "@aa-sdk/core";
import type { Chain } from "viem";
import type { AlchemyTransport } from "../alchemyTransport.js";
import type { ClientWithAlchemyMethods } from "./types.js";

/**
 * Creates an Alchemy public RPC client with the provided chain, connection configuration, and optional fetch options. The client has alchemy methods and can dynamically update HTTP headers.
 *
 * @example
 * ```ts
 * import { createAlchemyPublicRpcClient, alchemy } from "@account-kit/infra";
 * import { sepolia } from "@account-kit/infra";
 *
 * const client = createAlchemyPublicRpcClient({
 *  transport: alchemy({
 *    apiKey: "ALCHEMY_API_KEY"
 *  }),
 *  chain: sepolia,
 * });
 * ```
 *
 * @param {{connectionConfig: ConnectionConfig,chain: Chain,fetchOptions?: NoUndefined<HttpTransportConfig["fetchOptions"]>}} params The parameters for creating the Alchemy public RPC client
 * @param {ConnectionConfig} params.connectionConfig The connection configuration containing the RPC URL and API key
 * @param {Chain} params.chain The blockchain chain configuration
 * @param {NoUndefined<HttpTransportConfig["fetchOptions"]>} [params.fetchOptions] Optional fetch configuration for HTTP transport
 * @returns {ClientWithAlchemyMethods} A client object tailored with Alchemy methods and capabilities to interact with the blockchain
 */
export const createAlchemyPublicRpcClient = ({
  transport,
  chain,
}: {
  transport: AlchemyTransport;
  chain: Chain | undefined;
}): ClientWithAlchemyMethods => {
  return createBundlerClient({
    chain,
    transport,
  });
};
