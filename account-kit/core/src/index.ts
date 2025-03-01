export type * from "./actions/createAccount.js";
export { createAccount } from "./actions/createAccount.js";
export { disconnect } from "./actions/disconnect.js";
export type * from "./actions/getAccount.js";
export { getAccount } from "./actions/getAccount.js";
export type * from "./actions/getBundlerClient.js";
export { getBundlerClient } from "./actions/getBundlerClient.js";
export { getChain } from "./actions/getChain.js";
export type * from "./actions/getConnection.js";
export { getConnection } from "./actions/getConnection.js";
export type * from "./actions/getSigner.js";
export { getSigner } from "./actions/getSigner.js";
export type * from "./actions/getSignerStatus.js";
export { getSignerStatus } from "./actions/getSignerStatus.js";
export type * from "./actions/getSmartAccountClient.js";
export { getSmartAccountClient } from "./actions/getSmartAccountClient.js";
export type * from "./actions/getUser.js";
export { getUser } from "./actions/getUser.js";
export type * from "./actions/reconnect.js";
export { reconnect } from "./actions/reconnect.js";
export { setChain } from "./actions/setChain.js";
export type * from "./actions/watchAccount.js";
export { watchAccount } from "./actions/watchAccount.js";
export type * from "./actions/watchBundlerClient.js";
export { watchBundlerClient } from "./actions/watchBundlerClient.js";
export { watchChain } from "./actions/watchChain.js";
export type * from "./actions/watchConnection.js";
export { watchConnection } from "./actions/watchConnection.js";
export type * from "./actions/watchSigner.js";
export { watchSigner } from "./actions/watchSigner.js";
export type * from "./actions/watchSignerStatus.js";
export { watchSignerStatus } from "./actions/watchSignerStatus.js";
export type * from "./actions/watchSmartAccountClient.js";
export { watchSmartAccountClient } from "./actions/watchSmartAccountClient.js";
export type * from "./actions/watchUser.js";
export { watchUser } from "./actions/watchUser.js";
export type * from "./createConfig.js";
export { DEFAULT_IFRAME_CONTAINER_ID, createConfig } from "./createConfig.js";
export { ClientOnlyPropertyError } from "./errors.js";
export { hydrate } from "./hydrate.js";
export {
  defaultAccountState,
  convertSignerStatusToState,
  createDefaultAccountState,
} from "./store/store.js";
export type {
  SignerStatus,
  StoreState,
  StoredState,
  Store,
  AccountState,
} from "./store/types.js";
export type * from "./types.js";
export {
  cookieStorage,
  cookieToInitialState,
  parseCookie,
} from "./utils/cookies.js";

/** Re-export core packages to make it easier to use this package without the lower level packages */
// Accounts
export type * from "@account-kit/smart-contracts";
export {
  MultiOwnerPlugin,
  MultisigPlugin,
  MultisigPluginAbi,
  MultisigPluginExecutionFunctionAbi,
  SessionKeyAccessListType,
  SessionKeyPermissionsBuilder,
  SessionKeyPlugin,
  SessionKeyPluginAbi,
  SessionKeyPluginExecutionFunctionAbi,
  SessionKeySigner,
  accountLoupeActions,
  createLightAccount,
  createMultiOwnerModularAccount as createModularAccount,
  createMultiOwnerLightAccount,
  createMultisigModularAccount,
  getMAInitializationData,
  getMSCAUpgradeToData,
  lightAccountClientActions,
  multiOwnerLightAccountClientActions,
  multiOwnerPluginActions,
  multisigPluginActions,
  multisigSignatureMiddleware,
  pluginManagerActions,
  sessionKeyPluginActions,
} from "@account-kit/smart-contracts";

// Infra
export type * from "@account-kit/infra";
export {
  createAlchemySmartAccountClient,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "@account-kit/infra";
