import type { Address } from "abitype";
import {
  createPublicClient,
  http,
  type Chain,
  type FallbackTransport,
  type Hash,
  type Hex,
  type HttpTransport,
  type PublicClient,
  type Transport,
  type HttpTransportConfig,
} from "viem";
import type {
  EIP1193RequestFn,
  PublicRpcSchema,
} from "viem/dist/types/types/eip1193";
import type {
  BigNumberish,
  UserOperationEstimateGasResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
} from "../types.js";
import { VERSION } from "../version.js";
import type { Erc337RpcSchema, PublicErc4337Client } from "./types.js";

export const createPublicErc4337FromClient: <
  T extends Transport | FallbackTransport = Transport
>(
  client: PublicClient<T, Chain>
) => PublicErc4337Client<T> = <
  T extends Transport | FallbackTransport = Transport
>(
  client: PublicClient<T, Chain>
): PublicErc4337Client<T> => {
  const clientAdapter = client as PublicClient<T, Chain> & {
    request: EIP1193RequestFn<
      [Erc337RpcSchema[number], PublicRpcSchema[number]]
    >;
  };

  return {
    ...clientAdapter,
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

    getUserOperationByHash(hash: Hash): Promise<UserOperationResponse> {
      return clientAdapter.request({
        method: "eth_getUserOperationByHash",
        params: [hash],
      });
    },

    getUserOperationReceipt(hash: Hash): Promise<UserOperationReceipt> {
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

    getMaxPriorityFeePerGas(): Promise<BigNumberish> {
      return clientAdapter.request({
        method: "eth_maxPriorityFeePerGas",
        params: [],
      });
    },

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

    async getContractCode(address: string): Promise<Hex | `0x`> {
      const code = await clientAdapter.getBytecode({
        address: address as Address,
      });
      return code ?? "0x";
    },
  } as PublicErc4337Client<T>;
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
