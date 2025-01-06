// Add you exports here, make sure to export types separately from impls and use the `type` keyword when exporting them
// Don't use wildcard exports, instead use named exports

//light-account exports
export type * from "./light-account/accounts/account.js";
export { createLightAccount } from "./light-account/accounts/account.js";
export { transferOwnership as transferLightAccountOwnership } from "./light-account/actions/transferOwnership.js";
export {
  createLightAccountAlchemyClient,
  type AlchemyLightAccountClientConfig,
} from "./light-account/clients/alchemyClient.js";
export { createLightAccountClient } from "./light-account/clients/client.js";
export {
  createMultiOwnerLightAccountAlchemyClient,
  type AlchemyMultiOwnerLightAccountClientConfig,
} from "./light-account/clients/multiOwnerAlchemyClient.js";
export type * from "./light-account/decorators/lightAccount.js";
export { lightAccountClientActions } from "./light-account/decorators/lightAccount.js";
export type * from "./light-account/types.js";

export {
  AccountVersionRegistry,
  LightAccountUnsupported1271Factories,
  LightAccountUnsupported1271Impls,
  defaultLightAccountVersion,
  getDefaultLightAccountFactoryAddress,
  getDefaultMultiOwnerLightAccountFactoryAddress,
  getLightAccountVersionForAccount,
} from "./light-account/utils.js";

//multi-owner-light-account exports
export type * from "./light-account/accounts/multiOwner.js";
export { createMultiOwnerLightAccount } from "./light-account/accounts/multiOwner.js";
export { updateOwners as updateMultiOwnerLightAccountOwners } from "./light-account/actions/updateOwners.js";
export { createMultiOwnerLightAccountClient } from "./light-account/clients/multiOwnerLightAccount.js";
export type * from "./light-account/decorators/multiOwnerLightAccount.js";
export { multiOwnerLightAccountClientActions } from "./light-account/decorators/multiOwnerLightAccount.js";

// msca exports
export { IAccountLoupeAbi } from "./msca/abis/IAccountLoupe.js";
export { IPluginAbi } from "./msca/abis/IPlugin.js";
export { IPluginManagerAbi } from "./msca/abis/IPluginManager.js";
export { IStandardExecutorAbi } from "./msca/abis/IStandardExecutor.js";
export { MultiOwnerModularAccountFactoryAbi } from "./msca/abis/MultiOwnerModularAccountFactory.js";
export { MultisigModularAccountFactoryAbi } from "./msca/abis/MultisigModularAccountFactory.js";
export { UpgradeableModularAccountAbi } from "./msca/abis/UpgradeableModularAccount.js";
export type * from "./msca/account-loupe/decorator.js";
export { accountLoupeActions } from "./msca/account-loupe/decorator.js";
export type * from "./msca/account-loupe/types.js";
export type * from "./msca/account/multiOwnerAccount.js";
export { createMultiOwnerModularAccount } from "./msca/account/multiOwnerAccount.js";
export type * from "./msca/account/multisigAccount.js";
export { createMultisigModularAccount } from "./msca/account/multisigAccount.js";
export { standardExecutor } from "./msca/account/standardExecutor.js";
export {
  createModularAccountAlchemyClient,
  type AlchemyModularAccountClientConfig,
} from "./msca/client/alchemyClient.js";
export {
  createMultiOwnerModularAccountClient,
  createMultisigModularAccountClient,
} from "./msca/client/client.js";
export {
  createMultisigAccountAlchemyClient,
  type AlchemyMultisigAccountClientConfig,
} from "./msca/client/multiSigAlchemyClient.js";
export {
  InvalidAggregatedSignatureError,
  InvalidContextSignatureError,
  MultisigAccountExpectedError,
  MultisigMissingSignatureError,
} from "./msca/errors.js";
export type * from "./msca/plugin-manager/decorator.js";
export { pluginManagerActions } from "./msca/plugin-manager/decorator.js";
export { installPlugin } from "./msca/plugin-manager/installPlugin.js";
export { multiOwnerPluginActions } from "./msca/plugins/multi-owner/extension.js";
export type * from "./msca/plugins/multi-owner/index.js";
export {
  MultiOwnerPlugin,
  MultiOwnerPluginAbi,
  MultiOwnerPluginExecutionFunctionAbi,
} from "./msca/plugins/multi-owner/plugin.js";
export type * from "./msca/plugins/multisig/index.js";
export {
  MultisigPlugin,
  MultisigPluginAbi,
  MultisigPluginExecutionFunctionAbi,
  multisigPluginActions,
  multisigSignatureMiddleware,
} from "./msca/plugins/multisig/index.js";
export {
  combineSignatures,
  formatSignatures,
  getSignerType,
  splitAggregatedSignature,
} from "./msca/plugins/multisig/utils/index.js";
export { sessionKeyPluginActions } from "./msca/plugins/session-key/extension.js";
export type * from "./msca/plugins/session-key/index.js";
export type * from "./msca/plugins/session-key/permissions.js";
export {
  SessionKeyAccessListType,
  SessionKeyPermissionsBuilder,
} from "./msca/plugins/session-key/permissions.js";
export {
  SessionKeyPlugin,
  SessionKeyPluginAbi,
  SessionKeyPluginExecutionFunctionAbi,
} from "./msca/plugins/session-key/plugin.js";
export { SessionKeySigner } from "./msca/plugins/session-key/signer.js";
export { buildSessionKeysToRemoveStruct } from "./msca/plugins/session-key/utils.js";
export type * from "./msca/plugins/types.js";
export {
  getDefaultMultiOwnerModularAccountFactoryAddress,
  getDefaultMultisigModularAccountFactoryAddress,
  getMAInitializationData,
  getMSCAUpgradeToData,
} from "./msca/utils.js";

// ma v2 exports
export { accountFactoryAbi } from "./ma-v2/abis/accountFactoryAbi.js";
export { modularAccountAbi } from "./ma-v2/abis/modularAccountAbi.js";
export { semiModularAccountBytecodeAbi } from "./ma-v2/abis/semiModularAccountBytecodeAbi.js";
export { semiModularAccountStorageAbi } from "./ma-v2/abis/semiModularAccountStorageAbi.js";

export { nativeSMASigner } from "./ma-v2/account/nativeSMASigner.js";
export type * from "./ma-v2/account/semiModularAccountV2.js";
export { createSMAV2Account } from "./ma-v2/account/semiModularAccountV2.js";

export type {
  ModuleEntity,
  ValidationConfig,
  HookConfig,
  ValidationData,
} from "./ma-v2/actions/common/types.js";
export { HookType } from "./ma-v2/actions/common/types.js";
export {
  serializeValidationConfig,
  serializeHookConfig,
  serializeModuleEntity,
} from "./ma-v2/actions/common/utils.js";
export type * from "./ma-v2/actions/install-validation/installValidation.js";
export { installValidationActions } from "./ma-v2/actions/install-validation/installValidation.js";

export type * from "./ma-v2/client/client.js";
export { createSMAV2AccountClient } from "./ma-v2/client/client.js";

export {
  getDefaultAllowlistModuleAddress,
  getDefaultNativeTokenLimitModuleAddress,
  getDefaultPaymasterGuardModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
  getDefaultWebauthnValidationModuleAddress,
} from "./ma-v2/modules/utils.js";
export { allowlistModuleAbi } from "./ma-v2/modules/allowlist-module/abis/allowlistModuleAbi.js";
export { AllowlistModule } from "./ma-v2/modules/allowlist-module/module.js";
export { nativeTokenLimitModuleAbi } from "./ma-v2/modules/native-token-limit-module/abis/nativeTokenLimitModuleAbi.js";
export { NativeTokenLimitModule } from "./ma-v2/modules/native-token-limit-module/module.js";
export { paymasterGuardModuleAbi } from "./ma-v2/modules/paymaster-guard-module/abis/paymasterGuardModuleAbi.js";
export { PaymasterGuardModule } from "./ma-v2/modules/paymaster-guard-module/module.js";
export { singleSignerValidationModuleAbi } from "./ma-v2/modules/single-signer-validation/abis/singleSignerValidationModuleAbi.js";
export { SingleSignerValidationModule } from "./ma-v2/modules/single-signer-validation/module.js";
export { timeRangeModuleAbi } from "./ma-v2/modules/time-range-module/abis/timeRangeModuleAbi.js";
export { TimeRangeModule } from "./ma-v2/modules/time-range-module/module.js";
export { webauthnValidationModuleAbi } from "./ma-v2/modules/webauthn-validation/abis/webauthnValidationAbi.js";
