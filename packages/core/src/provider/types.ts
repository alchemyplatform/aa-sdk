import type { Address } from "abitype";
import type {
  Hash,
  Hex,
  HttpTransport,
  RpcTransactionRequest,
  Transport,
} from "viem";
import type { SignTypedDataParameters } from "viem/accounts";
import type {
  ISmartContractAccount,
  SignTypedDataParams,
} from "../account/types.js";
import type {
  PublicErc4337Client,
  SupportedTransports,
} from "../client/types.js";
import type {
  BatchUserOperationCallData,
  UserOperationCallData,
  UserOperationReceipt,
  UserOperationRequest,
  UserOperationResponse,
  UserOperationStruct,
} from "../types.js";
import type { Deferrable } from "../utils";

type WithRequired<T, K extends keyof T> = Required<Pick<T, K>>;
type WithOptional<T, K extends keyof T> = Pick<Partial<T>, K>;

export type ConnectorData = {
  chainId?: Hex;
};

export interface ProviderEvents {
  chainChanged(chainId: Hex): void;
  accountsChanged(accounts: Address[]): void;
  connect(data: ConnectorData): void;
  message({ type, data }: { type: string; data?: unknown }): void;
  disconnect(): void;
  error(error: Error): void;
}

export type SendUserOperationResult = {
  hash: Hash;
  request: UserOperationRequest;
};

export type AccountMiddlewareFn = (
  struct: Deferrable<UserOperationStruct>
) => Promise<Deferrable<UserOperationStruct>>;

export type AccountMiddlewareOverrideFn<
  Req extends keyof UserOperationStruct = never,
  Opt extends keyof UserOperationStruct = never
> = (
  struct: Deferrable<UserOperationStruct>
) => Promise<
  WithRequired<UserOperationStruct, Req> &
    WithOptional<UserOperationStruct, Opt>
>;

export type PaymasterAndDataMiddleware = AccountMiddlewareOverrideFn<
  "paymasterAndData",
  | "callGasLimit"
  | "preVerificationGas"
  | "verificationGasLimit"
  | "maxFeePerGas"
  | "maxPriorityFeePerGas"
>;

export type GasEstimatorMiddleware = AccountMiddlewareOverrideFn<
  "callGasLimit" | "preVerificationGas" | "verificationGasLimit"
>;
export type FeeDataMiddleware = AccountMiddlewareOverrideFn<
  "maxFeePerGas" | "maxPriorityFeePerGas"
>;

// TODO: this also will need to implement EventEmitteer
export interface ISmartAccountProvider<
  TTransport extends SupportedTransports = Transport
> {
  readonly rpcClient:
    | PublicErc4337Client<TTransport>
    | PublicErc4337Client<HttpTransport>;
  readonly dummyPaymasterDataMiddleware: AccountMiddlewareFn;
  readonly paymasterDataMiddleware: AccountMiddlewareFn;
  readonly gasEstimator: AccountMiddlewareFn;
  readonly feeDataGetter: AccountMiddlewareFn;
  readonly customMiddleware?: AccountMiddlewareFn;

  readonly account?: ISmartContractAccount;

  /**
   * Sends a user operation using the connected account.
   * Before executing, sendUserOperation will run the user operation through the middleware pipeline.
   * The order of the middlewares is:
   * 1. dummyPaymasterDataMiddleware -- populates a dummy paymaster data to use in estimation (default: "0x")
   * 2. feeDataGetter -- sets maxfeePerGas and maxPriorityFeePerGas
   * 3. gasEstimator -- calls eth_estimateUserOperationGas
   * 4. paymasterMiddleware -- used to set paymasterAndData. (default: "0x")
   * 5. customMiddleware -- allows you to override any of the results returned by previous middlewares
   *
   * @param data - either {@link UserOperationCallData} or {@link BatchUserOperationCallData}
   * @returns - {@link SendUserOperationResult} containing the hash and request
   */
  sendUserOperation: (
    data: UserOperationCallData | BatchUserOperationCallData
  ) => Promise<SendUserOperationResult>;

  /**
   * Attempts to drop and replace an existing user operation by increasing fees
   *
   * @param data - an existing user operation request returned by `sendUserOperation`
   * @returns - {@link SendUserOperationResult} containing the hash and request
   */
  dropAndReplaceUserOperation: (
    data: UserOperationRequest
  ) => Promise<SendUserOperationResult>;

  /**
   * Allows you to get the unsigned UserOperation struct with all of the middleware run on it
   *
   * @param data - either {@link UserOperationCallData} or {@link BatchUserOperationCallData}
   * @returns - {@link UserOperationStruct} resulting from the middleware pipeline
   */
  buildUserOperation: (
    data: UserOperationCallData | BatchUserOperationCallData
  ) => Promise<UserOperationStruct>;

  /**
   * Allows you to get the unsigned UserOperation struct with all of the middleware run on it
   * converted from a traditional ethereum transaction
   *
   * @param data - {@link RpcTransactionRequest} the tx to convert to a UserOperation
   * @returns - {@link UserOperationStruct} resulting from the middleware pipeline
   */
  buildUserOperationFromTx: (
    tx: RpcTransactionRequest
  ) => Promise<UserOperationStruct>;

  /**
   * This will wait for the user operation to be included in a transaction that's been mined.
   * The default retry and wait logic is configured on the Provider itself
   *
   * @param hash the user operation hash you want to wait for
   * @returns the tx hash that included this user operation
   */
  waitForUserOperationTransaction: (hash: Hash) => Promise<Hash>;

  /**
   * calls `eth_getUserOperationByHash` and returns the {@link UserOperationResponse}
   *
   * @param hash - the hash of the UserOperation to get the receipt for
   * @returns - {@link UserOperationResponse}
   */
  getUserOperationByHash: (hash: Hash) => Promise<UserOperationResponse | null>;

  /**
   * calls `eth_getUserOperationReceipt` and returns the {@link UserOperationReceipt}
   *
   * @param hash - the hash of the UserOperation to get the receipt for
   * @returns - {@link UserOperationReceipt}
   */
  getUserOperationReceipt: (hash: Hash) => Promise<UserOperationReceipt | null>;

  /**
   * This takes an ethereum transaction and converts it into a UserOperation, sends the UserOperation, and waits
   * on the receipt of that UserOperation (ie. has it been mined). If you don't want to wait for the UserOperation
   * to mine, it's recommended to user {@link sendUserOperation} instead.
   *
   * @param request - a {@link RpcTransactionRequest} object representing a traditional ethereum transaction
   * @returns the transaction hash
   */
  sendTransaction: (request: RpcTransactionRequest) => Promise<Hash>;

  /**
   * This takes a set of  ethereum transactions and converts them into one UserOperation, sends the UserOperation, and waits
   * on the receipt of that UserOperation (ie. has it been mined). If you don't want to wait for the UserOperation
   * to mine, it's recommended to user {@link sendUserOperation} instead.
   *
   * NOTE: the account you're sending the transactions to MUST support batch transactions.
   *
   * @param request - a {@link RpcTransactionRequest} Array representing a traditional ethereum transaction
   * @returns the transaction hash
   */
  sendTransactions: (request: RpcTransactionRequest[]) => Promise<Hash>;

  /**
   * EIP-1193 compliant request method
   *
   * @param args - object containing the method and params to execute
   * @returns the result of the method call
   */
  request(args: { method: string; params?: any[] }): Promise<any>;

  /**
   * This method returns an ERC-191 compliant signed message
   *
   * @param msg - message to be signed
   * @returns the signed hash for the message passed
   */
  signMessage: (msg: string | Uint8Array) => Promise<Hash>;

  /**
   * This method is used to sign typed data as per ERC-712
   *
   * @param params - {@link SignTypedDataParameters}
   * @returns the signed hash for the typed data passed
   */
  signTypedData: (params: SignTypedDataParameters) => Promise<Hash>;

  /**
   * If the account is not deployed, it will sign the message and then wrap it in 6492 format
   *
   * @param msg - the message to sign
   * @returns ths signature wrapped in 6492 format
   */
  signMessageWith6492(msg: string | Uint8Array | Hex): Promise<Hex>;

  /**
   * If the account is not deployed, it will sign the typed data blob and then wrap it in 6492 format
   *
   * @param params - {@link SignTypedDataParameters}
   * @returns the signed hash for the params passed in wrapped in 6492 format
   */
  signTypedDataWith6492(params: SignTypedDataParams): Promise<Hash>;

  // TODO: potentially add methods here for something like viem's walletActions?
  /**
   * @returns the address of the connected account
   */
  getAddress: () => Promise<Address>;

  /**
   * @returns boolean flag indicating if the account is connected
   */
  isConnected: () => boolean;

  // Middelware Overriders
  /**
   * This method allows you to override the default dummy paymaster data middleware and get paymaster
   * and data middleware. These middleware are often used together. The dummy paymaster data is used in
   * gas estimation before we actually have paymaster data. Because the paymaster data has an impact on
   * the gas estimation, it's good to supply dummy paymaster data that is valid for your paymaster contract.
   * The getPaymasterAndDataMiddleware is used to make an RPC call to the paymaster contract to get the value
   * for paymasterAndData.
   *
   * @param overrides - optional functions for overriding the default paymaster middleware
   * @returns an update instance of this, which now uses the new middleware
   */
  withPaymasterMiddleware: (overrides: {
    dummyPaymasterDataMiddleware?: PaymasterAndDataMiddleware;
    paymasterDataMiddleware?: PaymasterAndDataMiddleware;
  }) => this;

  /**
   * Overrides the gasEstimator middleware which is used for setting the gasLimit fields on the UserOperation
   * prior to execution.
   *
   * @param override - a function for overriding the default gas estimator middleware
   * @returns
   */
  withGasEstimator: (override: GasEstimatorMiddleware) => this;

  /**
   * Overrides the feeDataGetter middleware which is used for setting the fee fields on the UserOperation
   * prior to execution.
   *
   * @param override - a function for overriding the default feeDataGetter middleware
   * @returns
   */
  withFeeDataGetter: (override: FeeDataMiddleware) => this;

  /**
   * This adds a final middleware step to the middleware stack that runs right before signature verification.
   * This can be used if you have an RPC that does most of the functions of the other middlewares for you and
   * you want to delegate that work to that RPC instead of chaining together multiple RPC calls via the default middlwares.
   *
   * @param override - the UO transform function to run
   * @returns
   */
  withCustomMiddleware: (override: AccountMiddlewareFn) => this;

  /**
   * Sets the current account to the account returned by the given function. The function parameter
   * provides the public rpc client that is used by this provider so the account can make RPC calls.
   *
   * @param fn - a function that given public rpc client, returns a smart contract account
   */
  connect<TAccount extends ISmartContractAccount>(
    fn: (
      provider:
        | PublicErc4337Client<TTransport>
        | PublicErc4337Client<HttpTransport>
    ) => TAccount
  ): this & { account: TAccount };

  /**
   * Allows for disconnecting the account from the provider so you can connect the provider to another account instance
   *
   * @returns the provider with the account disconnected
   */
  disconnect(): this & { account: undefined };
}
