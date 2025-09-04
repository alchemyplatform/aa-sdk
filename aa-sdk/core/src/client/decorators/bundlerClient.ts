import type {
  Address,
  Chain,
  Client,
  Hash,
  PublicRpcSchema,
  RpcStateOverride,
  StateOverride,
  Transport,
} from "viem";
import { estimateUserOperationGas } from "../../actions/bundler/estimateUserOperationGas.js";
import { getSupportedEntryPoints } from "../../actions/bundler/getSupportedEntryPoints.js";
import { getUserOperationByHash } from "../../actions/bundler/getUserOperationByHash.js";
import { getUserOperationReceipt } from "../../actions/bundler/getUserOperationReceipt.js";
import { sendRawUserOperation } from "../../actions/bundler/sendRawUserOperation.js";
import type { EntryPointVersion } from "../../entrypoint/types.js";
import type {
  UserOperationEstimateGasResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
} from "../../types.js";

// Reference: https://eips.ethereum.org/EIPS/eip-4337#rpc-methods-eth-namespace
export type BundlerRpcSchema = [
  {
    Method: "eth_sendUserOperation";
    Parameters: [UserOperationRequest, Address];
    ReturnType: Hash;
  },
  {
    Method: "eth_estimateUserOperationGas";
    Parameters: [UserOperationRequest, Address, RpcStateOverride?];
    ReturnType: UserOperationEstimateGasResponse;
  },
  {
    Method: "eth_getUserOperationReceipt";
    Parameters: [Hash, "pending" | "latest" | undefined];
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
  },
];

// [!region BundlerActions]
export type BundlerActions = {
  /**
   * calls `eth_estimateUserOperationGas` and  returns the result
   *
   * @param request - the UserOperationRequest to estimate gas for
   * @param entryPoint - the entry point address the op will be sent to
   * @param stateOverride - the state override to use for the estimation
   * @returns the gas estimates for the given response
   */
  estimateUserOperationGas<
    TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
  >(
    request: UserOperationRequest<TEntryPointVersion>,
    entryPoint: Address,
    stateOverride?: StateOverride,
  ): Promise<UserOperationEstimateGasResponse<TEntryPointVersion>>;

  /**
   * calls `eth_sendUserOperation` and returns the hash of the sent UserOperation
   *
   * @param request - the UserOperationRequest to send
   * @param entryPoint - the entry point address the op will be sent to
   * @returns the hash of the sent UserOperation
   */
  sendRawUserOperation<
    TEntryPointVersion extends EntryPointVersion = EntryPointVersion,
  >(
    request: UserOperationRequest<TEntryPointVersion>,
    entryPoint: Address,
  ): Promise<Hash>;

  /**
   * calls `eth_getUserOperationByHash` and returns the UserOperationResponse
   *
   * @param hash - the hash of the UserOperation to fetch
   * @returns - the user operation if found or null
   */
  getUserOperationByHash(hash: Hash): Promise<UserOperationResponse | null>;

  /**
   * calls `eth_getUserOperationReceipt` and returns the UserOperationReceipt
   *
   * @param hash - the hash of the UserOperation to get the receipt for
   * @param tag - if client want to get receipt for different block tag.
   * @returns - a user operation receipt or null if not found
   */
  getUserOperationReceipt(
    hash: Hash,
    tag?: "pending" | "latest",
  ): Promise<UserOperationReceipt | null>;

  /**
   * calls `eth_supportedEntryPoints` and returns the entry points the RPC supports
   *
   * @returns - an array of the entrypoint addresses supported
   */
  getSupportedEntryPoints(): Promise<Address[]>;
};
// [!endregion BundlerActions]

/**
 * A viem client decorator that provides Bundler specific actions.
 * These actions include estimating gas for user operations, sending raw user operations, retrieving user operations by hash, getting supported entry points, and getting user operation receipts.
 *
 * NOTE: this is already added to the client returned from `createBundlerClient`
 *
 * @param {TClient} client The client instance that will be used to perform bundler actions
 * @returns {BundlerActions} An object containing various bundler-related actions that can be executed using the provided client
 */
export const bundlerActions: <
  TClient extends Client<
    Transport,
    Chain | undefined,
    any,
    [...PublicRpcSchema, ...BundlerRpcSchema]
  >,
>(
  client: TClient,
) => BundlerActions = (client) => ({
  estimateUserOperationGas: async (request, entryPoint, stateOverride) =>
    estimateUserOperationGas(client, { request, entryPoint, stateOverride }),
  sendRawUserOperation: async (request, entryPoint) =>
    sendRawUserOperation(client, { request, entryPoint }),
  getUserOperationByHash: async (hash) =>
    getUserOperationByHash(client, { hash }),
  getSupportedEntryPoints: async () => getSupportedEntryPoints(client),
  getUserOperationReceipt: async (hash) =>
    getUserOperationReceipt(client, { hash }),
});
