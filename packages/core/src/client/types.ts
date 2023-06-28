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

export type SupportedTransports = Transport | FallbackTransport | HttpTransport;

export type Erc337RpcSchema = [
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
    ReturnType: UserOperationReceipt;
  },
  {
    Method: "eth_getUserOperationByHash";
    Parameters: [Hash];
    ReturnType: UserOperationResponse;
  },
  {
    Method: "eth_supportedEntryPoints";
    Parameters: [];
    ReturnType: Address[];
  },
  {
    Method: "eth_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: BigNumberish;
  }
];

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
  request: EIP1193RequestFn<[PublicRpcSchema[number], Erc337RpcSchema[number]]>;

  // below methods are not all erc4337 methods, but are the methods we need in the SmartContractAccountProvideer
  getMaxPriorityFeePerGas(): Promise<BigNumberish>;

  getFeeData(): Promise<{
    maxFeePerGas?: BigNumberish;
    maxPriorityFeePerGas?: BigNumberish;
  }>;

  getContractCode(address: string): Promise<Hex | `0x`>;
}
