import type { Address } from "abitype";
import type {
  Chain,
  FallbackTransport,
  Hash,
  Hex,
  HttpTransport,
  PublicClient,
  Transport,
} from "viem";
import type { PublicRequests } from "viem/dist/types/types/eip1193";
import type {
  BigNumberish,
  UserOperationEstimateGasResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
} from "../types.js";

export type SupportedTransports = Transport | FallbackTransport | HttpTransport;

export type Erc4337Requests = {
  request(args: {
    method: "eth_sendUserOperation";
    params: [UserOperationRequest, Address];
  }): Promise<Hash>;
  request(args: {
    method: "eth_estimateUserOperationGas";
    params: [UserOperationRequest, Address];
  }): Promise<UserOperationEstimateGasResponse>;
  request(args: {
    method: "eth_getUserOperationReceipt";
    params: [Hash];
  }): Promise<UserOperationReceipt>;
  request(args: {
    method: "eth_getUserOperationByHash";
    params: [Hash];
  }): Promise<UserOperationResponse>;
  request(args: {
    method: "eth_supportedEntryPoints";
    params: [];
  }): Promise<Address[]>;
  request(args: {
    method: "eth_maxPriorityFeePerGas";
    params: [];
  }): Promise<BigNumberish>;
};

export interface Erc4337Actions {
  /**
   * calls `eth_estimateUserOperationGas` and  returns the result
   *
   * @param request - the {@link UserOperationRequest} to estimate gas for
   * @param entryPoint - the entrypoint address the op will be sent to
   * @returns the gas estimates for the given response (see: {@link UserOperationEstimateGasResponse})
   */
  estimateUserOperationGas(
    request: UserOperationRequest,
    entryPoint: string
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
    entryPoint: string
  ): Promise<Hex>;

  /**
   * calls `eth_getUserOperationByHash` and returns the {@link UserOperationResponse}
   *
   * @param hash - the hash of the UserOperation to get the receipt for
   * @returns - {@link UserOperationResponse}
   */
  getUserOperationByHash(hash: Hash): Promise<UserOperationResponse>;

  /**
   * calls `eth_getUserOperationReceipt` and returns the {@link UserOperationReceipt}
   *
   * @param hash - the hash of the UserOperation to get the receipt for
   * @returns - {@link UserOperationResponse}
   */
  getUserOperationReceipt(hash: Hash): Promise<UserOperationReceipt>;

  /**
   * calls `eth_supportedEntryPoints` and returns the entrypoints the RPC
   * supports
   * @returns - {@link Address}[]
   */
  getSupportedEntryPoints(): Promise<Address[]>;
}

export interface PublicErc4337Client<T extends SupportedTransports = Transport>
  extends PublicClient<T, Chain>,
    Erc4337Actions {
  request: (PublicRequests & Erc4337Requests)["request"];

  // below methods are not all erc4337 methods, but are the methods we need in the SmartContractAccountProvideer
  getMaxPriorityFeePerGas(): Promise<BigNumberish>;

  getFeeData(): Promise<{
    maxFeePerGas?: BigNumberish;
    maxPriorityFeePerGas?: BigNumberish;
  }>;

  getContractCode(address: string): Promise<Hex | `0x`>;
}
