export type { Abi } from "abitype";
export type { Address, HttpTransport } from "viem";
export * as chains from "viem/chains";

export { EntryPointAbi } from "./abis/EntryPointAbi.js";
export { SimpleAccountAbi } from "./abis/SimpleAccountAbi.js";
export { SimpleAccountFactoryAbi } from "./abis/SimpleAccountFactoryAbi.js";

export { BaseSmartContractAccount } from "./account/base.js";
export { createSimpleSmartAccount } from "./account/simple.js";
export type { SimpleSmartAccount } from "./account/simple.js";
export type {
  BaseSmartAccountParams,
  SignTypedDataParams,
} from "./account/types.js";

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

export type * from "./client/decorators/publicErc4337Client.js";
export { erc4337ClientActions } from "./client/decorators/publicErc4337Client.js";
export type * from "./client/publicErc4337Client.js";
export {
  createPublicErc4337Client,
  createPublicErc4337FromClient,
} from "./client/publicErc4337Client.js";
export { createPublicErc4337ClientSchema } from "./client/schema.js";
export type * from "./client/types.js";

export {
  convertChainIdToCoinType,
  convertCoinTypeToChain,
  convertCoinTypeToChainId,
} from "./ens/utils.js";

export {
  ConnectionConfigSchema,
  SmartAccountClientOptsSchema as SmartAccountProviderOptsSchema,
} from "./client/schema.js";
export type * from "./client/types.js";

export type * from "./types.js";
export type * from "./utils/index.js";
export {
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

export { LogLevel, Logger } from "./logger.js";

export type * from "./account/smartContractAccount.js";
export {
  getAccountAddress,
  parseFactoryAddressFromAccountInitCode,
  toSmartContractAccount,
} from "./account/smartContractAccount.js";

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

export type * from "./client/decorators/smartAccountClient.js";
export { smartAccountClientDecorator } from "./client/decorators/smartAccountClient.js";
export type * from "./client/smartAccountClient.js";
export {
  createSmartAccountClient,
  createSmartAccountClientFromExisting,
} from "./client/smartAccountClient.js";

export { middlewareActions } from "./middleware/actions.js";
export { defaultFeeEstimator } from "./middleware/defaults/feeEstimator.js";
export { defaultGasEstimator } from "./middleware/defaults/gasEstimator.js";
export { overridePaymasterDataMiddleware } from "./middleware/defaults/overridePaymasterData.js";
export { defaultPaymasterAndData } from "./middleware/defaults/paymasterAndData.js";
export { noopMiddleware } from "./middleware/noopMiddleware.js";
export type * from "./middleware/types.js";

export { AccountNotFoundError } from "./errors/account.js";

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
} from "./chain/index.js";
