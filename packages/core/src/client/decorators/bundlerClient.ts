import type {
  Address,
  Chain,
  Client,
  Hash,
  PublicRpcSchema,
  Transport,
} from "viem";
import { estimateUserOperationGas } from "../../actions/bundler/estimateUserOperationGas.js";
import { getSupportedEntryPoints } from "../../actions/bundler/getSupportedEntrypoints.js";
import { getUserOperationByHash } from "../../actions/bundler/getUserOperationByHash.js";
import { getUserOperationReceipt } from "../../actions/bundler/getUserOperationReceipt.js";
import { sendRawUserOperation } from "../../actions/bundler/sendRawUserOperation.js";
import type {
  UserOperationEstimateGasResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
} from "../../types.js";

export type BundlerRpcSchema = [
  {
    Method: "eth_sendUserOperation";
    Parameters: [UserOperationRequest, Address];
    ReturnType: Hash;
  },
  {
    Method: "eth_estimateUserOperationGas";
    Parameters: [UserOperationRequest, Address];
    ReturnType: UserOperationEstimateGasResponse;
  },
  {
    Method: "eth_getUserOperationReceipt";
    Parameters: [Hash];
    ReturnType: UserOperationReceipt | null;
  },
  {
    Method: "eth_getUserOperationByHash";
    Parameters: [Hash];
    ReturnType: UserOperationResponse | null;
  },
  {
    Method: "eth_supportedEntryPoints";
    Parameters: [];
    ReturnType: Address[];
  }
];

export type BundlerActions = {
  /**
   * calls `eth_estimateUserOperationGas` and  returns the result
   *
   * @param request - the {@link UserOperationRequest} to estimate gas for
   * @param entryPoint - the entrypoint address the op will be sent to
   * @returns the gas estimates for the given response (see: {@link UserOperationEstimateGasResponse})
   */
  estimateUserOperationGas(
    request: UserOperationRequest,
    entryPoint: Address
  ): Promise<UserOperationEstimateGasResponse>;

  /**
   * calls `eth_sendUserOperation` and returns the hash of the sent UserOperation
   *
   * @param request - the {@link UserOperationRequest} to send
   * @param entryPoint - the entrypoint address the op will be sent to
   * @returns the hash of the sent UserOperation
   */
  sendRawUserOperation(
    request: UserOperationRequest,
    entryPoint: Address
  ): Promise<Hash>;

  /**
   * calls `eth_getUserOperationByHash` and returns the {@link UserOperationResponse}
   *
   * @param hash - the hash of the UserOperation to fetch
   * @returns - {@link UserOperationResponse}
   */
  getUserOperationByHash(hash: Hash): Promise<UserOperationResponse | null>;

  /**
   * calls `eth_getUserOperationReceipt` and returns the {@link UserOperationReceipt}
   *
   * @param hash - the hash of the UserOperation to get the receipt for
   * @returns - {@link UserOperationResponse}
   */
  getUserOperationReceipt(hash: Hash): Promise<UserOperationReceipt | null>;

  /**
   * calls `eth_supportedEntryPoints` and returns the entrypoints the RPC
   * supports
   * @returns - {@link Address}[]
   */
  getSupportedEntryPoints(): Promise<Address[]>;
};

export const bundlerActions: <
  TClient extends Client<
    Transport,
    Chain | undefined,
    any,
    [...PublicRpcSchema, ...BundlerRpcSchema]
  >
>(
  client: TClient
) => BundlerActions = (client) => ({
  estimateUserOperationGas: async (request, entryPoint) =>
    estimateUserOperationGas(client, { request, entryPoint }),
  sendRawUserOperation: async (request, entryPoint) =>
    sendRawUserOperation(client, { request, entryPoint }),
  getUserOperationByHash: async (hash) =>
    getUserOperationByHash(client, { hash }),
  getSupportedEntryPoints: async () => getSupportedEntryPoints(client),
  getUserOperationReceipt: async (hash) =>
    getUserOperationReceipt(client, { hash }),
});
