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

// [!region BundlerActions]
export type BundlerActions = {
  /**
   * calls `eth_estimateUserOperationGas` and  returns the result
   *
   * @param request - the {@link UserOperationRequest} to estimate gas for
   * @param entryPoint - the entry point address the op will be sent to
   * @param stateOverride - the state override to use for the estimation
   * @returns the gas estimates for the given response (see: {@link UserOperationEstimateGasResponse})
   */
  estimateUserOperationGas<
    TEntryPointVersion extends EntryPointVersion = EntryPointVersion
  >(
    request: UserOperationRequest<TEntryPointVersion>,
    entryPoint: Address,
    stateOverride?: StateOverride
  ): Promise<UserOperationEstimateGasResponse<TEntryPointVersion>>;

  /**
   * calls `eth_sendUserOperation` and returns the hash of the sent UserOperation
   *
   * @param request - the {@link UserOperationRequest} to send
   * @param entryPoint - the entry point address the op will be sent to
   * @returns the hash of the sent UserOperation
   */
  sendRawUserOperation<
    TEntryPointVersion extends EntryPointVersion = EntryPointVersion
  >(
    request: UserOperationRequest<TEntryPointVersion>,
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
   * @returns - {@link UserOperationReceipt}
   */
  getUserOperationReceipt(hash: Hash): Promise<UserOperationReceipt | null>;

  /**
   * calls `eth_supportedEntryPoints` and returns the entry points the RPC supports
   *
   * @returns - {@link Address}[]
   */
  getSupportedEntryPoints(): Promise<Address[]>;
};
// [!endregion BundlerActions]

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
