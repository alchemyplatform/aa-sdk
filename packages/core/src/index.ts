export type { Abi } from "abitype";
export type { Address, HttpTransport } from "viem";
export * as chains from "viem/chains";

export { EntryPointAbi } from "./abis/EntryPointAbi.js";
export { SimpleAccountAbi } from "./abis/SimpleAccountAbi.js";
export { SimpleAccountFactoryAbi } from "./abis/SimpleAccountFactoryAbi.js";
export { BaseSmartContractAccount } from "./account/base.js";
export { createSimpleSmartAccount } from "./account/simple.js";
export type { SimpleSmartAccount } from "./account/simple.js";
export type * from "./account/smartContractAccount.js";
export {
  getAccountAddress,
  parseFactoryAddressFromAccountInitCode,
  toSmartContractAccount,
} from "./account/smartContractAccount.js";
export type {
  BaseSmartAccountParams,
  SignTypedDataParams,
} from "./account/types.js";
export { buildUserOperation } from "./actions/smartAccount/buildUserOperation.js";
export { buildUserOperationFromTx } from "./actions/smartAccount/buildUserOperationFromTx.js";
export { buildUserOperationFromTxs } from "./actions/smartAccount/buildUserOperationFromTxs.js";
export { checkGasSponsorshipEligibility } from "./actions/smartAccount/checkGasSponsorshipEligibility.js";
export { dropAndReplaceUserOperation } from "./actions/smartAccount/dropAndReplaceUserOperation.js";
export { sendTransaction } from "./actions/smartAccount/sendTransaction.js";
export { sendTransactions } from "./actions/smartAccount/sendTransactions.js";
export { sendUserOperation } from "./actions/smartAccount/sendUserOperation.js";
export type * from "./actions/smartAccount/types.js";
export { waitForUserOperationTransaction } from "./actions/smartAccount/waitForUserOperationTransacation.js";
export {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "./chains/index.js";
export type * from "./client/bundlerClient.js";
export {
  createBundlerClient,
  createBundlerClientFromExisting,
} from "./client/bundlerClient.js";
export type * from "./client/decorators/bundlerClient.js";
export { bundlerActions } from "./client/decorators/bundlerClient.js";
export type * from "./client/decorators/smartAccountClient.js";
export { smartAccountClientActions as smartAccountClientDecorator } from "./client/decorators/smartAccountClient.js";
export { isSmartAccountClient } from "./client/isSmartAccountClient.js";
export {
  ConnectionConfigSchema,
  SmartAccountClientOptsSchema as SmartAccountProviderOptsSchema,
} from "./client/schema.js";
export type * from "./client/smartAccountClient.js";
export {
  createSmartAccountClient,
  createSmartAccountClientFromExisting,
} from "./client/smartAccountClient.js";
export type * from "./client/types.js";
export {
  convertChainIdToCoinType,
  convertCoinTypeToChain,
  convertCoinTypeToChainId,
} from "./ens/utils.js";
export {
  AccountNotFoundError,
  DefaultFactoryNotDefinedError,
  FailedToGetStorageSlotError,
  GetCounterFactualAddressError,
} from "./errors/account.js";
export { BaseError } from "./errors/base.js";
export {
  ChainNotFoundError,
  IncompatibleClientError,
  InvalidRpcUrlError,
} from "./errors/client.js";
export { EntrypointNotFoundError } from "./errors/entrypoint.js";
export { InvalidSignerTypeError } from "./errors/signer.js";
export {
  FailedToFindTransactionError,
  TransactionMissingToParamError,
} from "./errors/transaction.js";
export { InvalidUserOperationError } from "./errors/useroperation.js";
export { LogLevel, Logger } from "./logger.js";
export { middlewareActions } from "./middleware/actions.js";
export { defaultFeeEstimator } from "./middleware/defaults/feeEstimator.js";
export { defaultGasEstimator } from "./middleware/defaults/gasEstimator.js";
export { overridePaymasterDataMiddleware } from "./middleware/defaults/overridePaymasterData.js";
export { defaultPaymasterAndData } from "./middleware/defaults/paymasterAndData.js";
export { noopMiddleware } from "./middleware/noopMiddleware.js";
export type * from "./middleware/types.js";
export { LocalAccountSigner } from "./signer/local-account.js";
export { SignerSchema, isSigner } from "./signer/schema.js";
export type {
  SmartAccountAuthenticator,
  SmartAccountSigner,
} from "./signer/types.js";
export {
  verifyEIP6492Signature,
  wrapSignatureWith6492,
} from "./signer/utils.js";
export { WalletClientSigner } from "./signer/wallet-client.js";
export type * from "./types.js";
export type * from "./utils/index.js";
export {
  AlchemyChainMap,
  ChainSchema,
  applyUserOpFeeOption,
  applyUserOpOverride,
  applyUserOpOverrideOrFeeOption,
  asyncPipe,
  bigIntMax,
  bigIntPercent,
  deepHexlify,
  defineReadOnly,
  filterUndefined,
  getChain,
  getDefaultEntryPointAddress,
  getDefaultSimpleAccountFactoryAddress,
  getDefaultUserOperationFeeOptions,
  getUserOperationHash,
  isBigNumberish,
  isPercentage,
  resolveProperties,
} from "./utils/index.js";
