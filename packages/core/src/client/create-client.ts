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
  type PublicRpcSchema,
  type Transport,
} from "viem";
import type {
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
  return client.extend(erc4337ClientActions);
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
