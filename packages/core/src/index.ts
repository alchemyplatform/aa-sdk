export type { Abi } from "abitype";
export type { Address, HttpTransport } from "viem";
export * as chains from "viem/chains";

export { EntryPointAbi } from "./abis/EntryPointAbi.js";
export { SimpleAccountAbi } from "./abis/SimpleAccountAbi.js";
export { SimpleAccountFactoryAbi } from "./abis/SimpleAccountFactoryAbi.js";

export { BaseSmartContractAccount } from "./account/base.js";
export type { BaseSmartAccountParams } from "./account/base.js";
export { SimpleSmartContractAccount } from "./account/simple.js";
export type {
  SimpleSmartAccountOwner,
  SimpleSmartAccountParams,
} from "./account/simple.js";
export type * from "./account/types.js";

export {
  createPublicErc4337Client,
  createPublicErc4337FromClient,
} from "./client/create-client.js";
export type * from "./client/types.js";

export {
  alchemyPaymasterAndDataMiddleware,
  withAlchemyGasManager,
} from "./middleware/alchemy-paymaster.js";
export type { AlchemyPaymasterConfig } from "./middleware/alchemy-paymaster.js";

export { SmartAccountProvider, noOpMiddleware } from "./provider/base.js";
export type { SmartAccountProviderOpts } from "./provider/base.js";
export type * from "./provider/types.js";

export type * from "./types.js";
export {
  asyncPipe,
  deepHexlify,
  getChain,
  getUserOperationHash,
  resolveProperties,
} from "./utils.js";
