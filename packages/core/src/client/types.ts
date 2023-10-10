import type { Address } from "abitype";
import type {
  Chain,
  Client,
  FallbackTransport,
  Hash,
  HttpTransport,
  PublicActions,
  PublicRpcSchema,
  Transport,
} from "viem";
import type {
  UserOperationEstimateGasResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
} from "../types.js";

export type SupportedTransports = Transport | FallbackTransport | HttpTransport;

export type Erc4337RpcSchema = [
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

export type Erc4337Actions = {
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
  sendUserOperation(
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

export type PublicErc4337Client<T extends SupportedTransports = Transport> =
  Client<
    T,
    Chain,
    undefined,
    [...PublicRpcSchema, ...Erc4337RpcSchema],
    PublicActions<T, Chain> & Erc4337Actions
  >;
