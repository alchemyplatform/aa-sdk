import type {
  Address,
  Chain,
  Client,
  Hash,
  PublicRpcSchema,
  Transport,
} from "viem";
import { estimateUserOperationGas } from "../../actions/publicErc4337/estimateUserOperationGas.js";
import { getSupportedEntryPoints } from "../../actions/publicErc4337/getSupportedEntrypoints.js";
import { getUserOperationByHash } from "../../actions/publicErc4337/getUserOperationByHash.js";
import { getUserOperationReceipt } from "../../actions/publicErc4337/getUserOperationReceipt.js";
import { sendRawUserOperation } from "../../actions/publicErc4337/sendRawUserOperation.js";
import type {
  UserOperationEstimateGasResponse,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
} from "../../types";

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

export const erc4337ClientActions: <
  TClient extends Client<
    Transport,
    Chain | undefined,
    any,
    [...PublicRpcSchema, ...Erc4337RpcSchema]
  >
>(
  client: TClient
) => Erc4337Actions = (client) => ({
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

// export const erc4337ClientActions = (client: Client) => {
//   const clientAdapter = client as Client<
//     Transport,
//     Chain | undefined,
//     undefined,
//     [...PublicRpcSchema, ...Erc4337RpcSchema],
//     PublicActions
//   >;

//   return {
//     estimateUserOperationGas(
//       request: UserOperationRequest,
//       entryPoint: string
//     ): Promise<UserOperationEstimateGasResponse> {
//       return clientAdapter.request({
//         method: "eth_estimateUserOperationGas",
//         params: [request, entryPoint as Address],
//       });
//     },

//     sendRawUserOperation(
//       request: UserOperationRequest,
//       entryPoint: string
//     ): Promise<Hex> {
//       return clientAdapter.request({
//         method: "eth_sendUserOperation",
//         params: [request, entryPoint as Address],
//       });
//     },

//     getUserOperationByHash(hash: Hash): Promise<UserOperationResponse | null> {
//       return clientAdapter.request({
//         method: "eth_getUserOperationByHash",
//         params: [hash],
//       });
//     },

//     getUserOperationReceipt(hash: Hash): Promise<UserOperationReceipt | null> {
//       return clientAdapter.request({
//         method: "eth_getUserOperationReceipt",
//         params: [hash],
//       });
//     },

//     getSupportedEntryPoints(): Promise<Address[]> {
//       return clientAdapter.request({
//         method: "eth_supportedEntryPoints",
//         params: [],
//       });
//     },
//   };
// };
