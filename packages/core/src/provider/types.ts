import type { Address } from "abitype";
import type { Hash, RpcTransactionRequest, Transport } from "viem";
import type { BaseSmartContractAccount } from "../account/base.js";
import type {
  PublicErc4337Client,
  SupportedTransports,
} from "../client/types.js";
import type {
  BatchUserOperationCallData,
  UserOperationCallData,
  UserOperationRequest,
  UserOperationStruct,
} from "../types.js";

export type SendUserOperationResult = {
  hash: string;
  request: UserOperationRequest;
};

export type AccountMiddlewareFn = (
  struct: UserOperationStruct
) => Promise<UserOperationStruct>;

export type AccountMiddlewareOverrideFn<
  K extends keyof UserOperationStruct = never
> = (
  struct: UserOperationStruct
) => Promise<Required<Pick<UserOperationStruct, K>>>;

export type PaymasterAndDataMiddleware =
  AccountMiddlewareOverrideFn<"paymasterAndData">;

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
  readonly rpcClient: PublicErc4337Client<TTransport>;
  readonly dummyPaymasterDataMiddleware: AccountMiddlewareFn;
  readonly paymasterDataMiddleware: AccountMiddlewareFn;
  readonly gasEstimator: AccountMiddlewareFn;
  readonly feeDataGetter: AccountMiddlewareFn;
  readonly customMiddleware?: AccountMiddlewareFn;

  readonly account?: BaseSmartContractAccount;

  /**
   * Sends a user operation using the connected account.
   * Before executing, sendUserOperation will run the user operation through the middleware pipeline.
   * The order of the middlewares is:
   * 1. dummyPaymasterDataMiddleware -- populates a dummy paymaster data to use in estimation (default: "0x")
   * 2. gasEstimator -- calls eth_estimateUserOperationGas
   * 3. feeDataGetter -- sets maxfeePerGas and maxPriorityFeePerGas
   * 4. paymasterMiddleware -- used to set paymasterAndData. (default: "0x")
   *
   * @param data - either {@link UserOperationCallData} or {@link BatchUserOperationCallData}
   * @returns - {@link SendUserOperationResult} containing the hash and request
   */
  sendUserOperation: (
    data: UserOperationCallData | BatchUserOperationCallData
  ) => Promise<SendUserOperationResult>;

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

  // TODO: potentially add methods here for signing or something like viem's walletActions?
  /**
   * @returns the address of the connected account
   */
  getAddress: () => Promise<Address>;

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
  connect(
    fn: (provider: PublicErc4337Client<TTransport>) => BaseSmartContractAccount
  ): this & { account: BaseSmartContractAccount };
}
