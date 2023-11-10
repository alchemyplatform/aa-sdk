export type { Abi } from "abitype";
export type { Address, HttpTransport } from "viem";
export * as chains from "viem/chains";

export { EntryPointAbi } from "./abis/EntryPointAbi.js";
export { SimpleAccountAbi } from "./abis/SimpleAccountAbi.js";
export { SimpleAccountFactoryAbi } from "./abis/SimpleAccountFactoryAbi.js";

export { BaseSmartContractAccount } from "./account/base.js";
export {
  SimpleSmartAccountParamsSchema,
  createBaseSmartAccountParamsSchema,
} from "./account/schema.js";
export { SimpleSmartContractAccount } from "./account/simple.js";
export type * from "./account/types.js";
export type { BaseSmartAccountParams } from "./account/types.js";

export { LocalAccountSigner } from "./signer/local-account.js";
export { SignerSchema } from "./signer/schema.js";
export type {
  SmartAccountAuthenticator,
  SmartAccountSigner,
} from "./signer/types.js";
export {
  verifyEIP6492Signature,
  wrapSignatureWith6492,
} from "./signer/utils.js";
export { WalletClientSigner } from "./signer/wallet-client.js";

export {
  createPublicErc4337Client,
  createPublicErc4337FromClient,
  erc4337ClientActions,
} from "./client/create-client.js";
export { createPublicErc4337ClientSchema } from "./client/schema.js";
export type * from "./client/types.js";

export {
  convertChainIdToCoinType,
  convertCoinTypeToChain,
  convertCoinTypeToChainId,
} from "./ens/utils.js";

export { SmartAccountProvider, noOpMiddleware } from "./provider/base.js";
export {
  SmartAccountProviderOptsSchema,
  createSmartAccountProviderConfigSchema,
} from "./provider/schema.js";
export type * from "./provider/types.js";

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
  getUserOperationHash,
  isBigNumberish,
  isPercentage,
  resolveProperties,
} from "./utils/index.js";

export { LogLevel, Logger } from "./logger.js";
