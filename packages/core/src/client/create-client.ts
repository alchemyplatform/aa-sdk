import type { Address } from "abitype";
import {
  createPublicClient,
  http,
  type Chain,
  type Client,
  type FallbackTransport,
  type Hash,
  type Hex,
  type HttpTransport,
  type HttpTransportConfig,
  type PublicActions,
  type PublicClient,
  type Transport,
} from "viem";
import type { PublicRpcSchema } from "viem/dist/types/types/eip1193";
import type {
  BigNumberish,
  UserOperationEstimateGasResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
} from "../types.js";
import { VERSION } from "../version.js";
import type { Erc4337RpcSchema, PublicErc4337Client } from "./types.js";

export const erc4337ClientActions = (client: Client) => {
  const clientAdapter = client as Client<
    Transport,
    Chain,
    undefined,
    [...PublicRpcSchema, ...Erc4337RpcSchema],
    PublicActions
  >;

  return {
    estimateUserOperationGas(
      request: UserOperationRequest,
      entryPoint: string
    ): Promise<UserOperationEstimateGasResponse> {
      return clientAdapter.request({
        method: "eth_estimateUserOperationGas",
        params: [request, entryPoint as Address],
      });
    },

    sendUserOperation(
      request: UserOperationRequest,
      entryPoint: string
    ): Promise<Hex> {
      return clientAdapter.request({
        method: "eth_sendUserOperation",
        params: [request, entryPoint as Address],
      });
    },

    getUserOperationByHash(hash: Hash): Promise<UserOperationResponse | null> {
      return clientAdapter.request({
        method: "eth_getUserOperationByHash",
        params: [hash],
      });
    },

    getUserOperationReceipt(hash: Hash): Promise<UserOperationReceipt | null> {
      return clientAdapter.request({
        method: "eth_getUserOperationReceipt",
        params: [hash],
      });
    },

    getSupportedEntryPoints(): Promise<Address[]> {
      return clientAdapter.request({
        method: "eth_supportedEntryPoints",
        params: [],
      });
    },
  };
};

export const createPublicErc4337FromClient: <
  T extends Transport | FallbackTransport = Transport
>(
  client: PublicClient<T, Chain>
) => PublicErc4337Client<T> = <
  T extends Transport | FallbackTransport = Transport
>(
  client: PublicClient<T, Chain>
): PublicErc4337Client<T> => {
  return client.extend((clientAdapter) => ({
    ...erc4337ClientActions(clientAdapter),
    async getFeeData(): Promise<{
      maxFeePerGas?: BigNumberish;
      maxPriorityFeePerGas?: BigNumberish;
    }> {
      // viem doesn't support getFeeData, so looking at ethers: https://github.com/ethers-io/ethers.js/blob/main/lib.esm/providers/abstract-provider.js#L472
      // also keeping this implementation the same as ethers so that the middlewares work consistently
      const block = await clientAdapter.getBlock({
        blockTag: "latest",
      });

      if (block && block.baseFeePerGas) {
        const maxPriorityFeePerGas = BigInt(1500000000);
        return {
          maxPriorityFeePerGas,
          maxFeePerGas: block.baseFeePerGas * BigInt(2) + maxPriorityFeePerGas,
        };
      }

      return {
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
      };
    },
  }));
};

export const createPublicErc4337Client = ({
  chain,
  rpcUrl,
  fetchOptions,
}: {
  chain: Chain;
  rpcUrl: string;
  fetchOptions?: HttpTransportConfig["fetchOptions"];
}): PublicErc4337Client<HttpTransport> => {
  const client = createPublicErc4337FromClient(
    createPublicClient({
      chain,
      transport: http(rpcUrl, {
        fetchOptions: {
          ...fetchOptions,
          headers: {
            ...fetchOptions?.headers,
            "Alchemy-AA-Sdk-Version": VERSION,
          },
        },
      }),
    })
  );

  return client;
};
