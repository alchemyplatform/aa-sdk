export type { Abi } from "abitype";
export type { Address, HttpTransport } from "viem";
export * as chains from "viem/chains";

export { EntryPointAbi } from "./abis/EntryPointAbi.js";
export { SimpleAccountAbi } from "./abis/SimpleAccountAbi.js";
export { SimpleAccountFactoryAbi } from "./abis/SimpleAccountFactoryAbi.js";

export { BaseSmartContractAccount } from "./account/base.js";
export type { BaseSmartAccountParams } from "./account/base.js";
export { SimpleSmartContractAccount } from "./account/simple.js";
export type { SimpleSmartAccountParams } from "./account/simple.js";
export type * from "./account/types.js";
export { LocalAccountSigner } from "./signer/local-account.js";
export type { SmartAccountSigner } from "./signer/types.js";
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
export type * from "./client/types.js";

export {
  convertChainIdToCoinType,
  convertCoinTypeToChain,
  convertCoinTypeToChainId,
} from "./ens/utils.js";

export { SmartAccountProvider, noOpMiddleware } from "./provider/base.js";
export type {
  SmartAccountProviderConfig,
  SmartAccountProviderOpts,
} from "./provider/base.js";
export type * from "./provider/types.js";

export type * from "./types.js";
export type * from "./utils/index.js";
export {
  asyncPipe,
  bigIntMax,
  bigIntPercent,
  deepHexlify,
  defineReadOnly,
  getChain,
  getUserOperationHash,
  resolveProperties,
} from "./utils/index.js";

export { Logger } from "./logger.js";
export type { LogLevel } from "./logger.js";
