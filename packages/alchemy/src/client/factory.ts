import {
  erc4337ClientActions,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import {
  createClient,
  http,
  publicActions,
  size,
  slice,
  type Address,
  type Chain,
  type Client,
  type HttpTransport,
  type HttpTransportConfig,
  type Transport,
} from "viem";
import type { DebugTransaction, SimulateExecutionResponse } from "./interfaces";
import type {
  AlchemyEnhanced4337Client,
  AlchemyEnhancedApiSchema,
} from "./types";

export const alchemyEnhancedApiActions = (client: Client) => {
  const clientAdapter = client as Client<
    Transport,
    Chain,
    undefined,
    AlchemyEnhancedApiSchema
  >;

  return {
    simulateUserOperationExecution(
      request: UserOperationRequest
    ): Promise<SimulateExecutionResponse | SimulateExecutionResponse[]> {
      const { sender, initCode, callData } = request;
      const entryPointAddress: Address =
        "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

      const innerTransactionObject: DebugTransaction = {
        from: entryPointAddress,
        to: sender,
        data: callData,
      };

      if (initCode === "0x") {
        return clientAdapter.request({
          method: "alchemy_simulateExecution",
          params: [innerTransactionObject],
        });
      }

      /**
       * @see {https://eips.ethereum.org/EIPS/eip-4337#client-behavior-upon-receiving-a-useroperation}
       *
       * "If initCode is not empty, parse its first 20 bytes as a factory address.
       * Record whether the factory is staked, in case the later simulation indicates that it needs to be.
       * If the factory accesses global state, it must be staked - see reputation, throttling and banning section for details."
       */
      if (size(initCode) !== 42) {
        throw new Error(
          `Invalid init code provided. Expected 0x or 42 bytes, got ${initCode}`
        );
      }

      const factoryAddress = slice(initCode, 2, 22);
      const initCalldata = slice(initCode, 22);

      return clientAdapter.request({
        method: "alchemy_simulateExecutionBundle",
        params: [
          [
            {
              from: entryPointAddress,
              to: factoryAddress,
              data: initCalldata,
            },
            innerTransactionObject,
          ],
        ],
      });
    },
  };
};

/**
 * The following client factory method to a viem public client.
 *
 * It extends the client with the following methods:
 * - `simulateUserOperationExecution`
 *
 * @param chain - the chain to connect to
 * @param rpcUrl - the rpc url to
 * @param fetchOptions - (optional) the fetch options to use when making requests
 */
export const createAlchemyEnhanced4337Client = ({
  chain,
  rpcUrl,
  fetchOptions,
}: {
  chain: Chain;
  rpcUrl: string;
  fetchOptions?: HttpTransportConfig["fetchOptions"];
}): AlchemyEnhanced4337Client<HttpTransport> =>
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
  }).extend((clientAdapter) => ({
    ...publicActions(clientAdapter),
    ...erc4337ClientActions(clientAdapter),
    ...alchemyEnhancedApiActions(clientAdapter),
  }));
