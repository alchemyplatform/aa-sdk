export type * from "./light-account/accounts/account.js";
export { toLightAccount } from "./light-account/accounts/account.js";

export type * from "./light-account/accounts/multi-owner-account.js";
export { toMultiOwnerLightAccount } from "./light-account/accounts/multi-owner-account.js";

// TODO(v5): Something to consider for v5 - can we cut the exports for the account-specific actions
// from the public interface, and just consume these internally with account + rely on the standard
// bundlerClient actions for performing state writes (i.e. rotating owners)? I'm not sure it's useful
// to consumers outside of attaching to instances of a client with the right action.
export type * from "./light-account/decorators/singleOwner.js";
export { singleOwnerLightAccountActions } from "./light-account/decorators/singleOwner.js";

export type * from "./light-account/decorators/multiOwner.js";
export { multiOwnerLightAccountActions } from "./light-account/decorators/multiOwner.js";

export type * from "./light-account/predictAddress.js";
export {
  predictLightAccountAddress,
  predictMultiOwnerLightAccountAddress,
} from "./light-account/predictAddress.js";

export type * from "./light-account/types.js";

export {
  AccountVersionRegistry,
  defaultLightAccountVersion,
  getDefaultLightAccountFactoryAddress,
  getDefaultMultiOwnerLightAccountFactoryAddress,
  getLightAccountImplAddress,
  LightAccountUnsupported1271Factories,
  LightAccountUnsupported1271Impls,
} from "./light-account/utils.js";

export {
  lightAccountStaticImplV1_0_1,
  lightAccountStaticImplV1_0_2,
  lightAccountStaticImplV1_1_0,
  lightAccountStaticImplV2_0_0,
  multiOwnerLightAccountStaticImplV2_0_0,
} from "./light-account/lightAccountStaticImpl.js";

export type * from "./ma-v2/accounts/account.js";
export { toModularAccountV2 } from "./ma-v2/accounts/account.js";

export type * from "./ma-v2/accounts/base.js";
export { toModularAccountV2Base } from "./ma-v2/accounts/base.js";

export type * from "./ma-v2/decorators/deferralActions.js";
export { deferralActions } from "./ma-v2/decorators/deferralActions.js";

export type * from "./ma-v2/decorators/installValidation.js";
export { installValidationActions } from "./ma-v2/decorators/installValidation.js";

// Modules.
export { AllowlistModule } from "./ma-v2/modules/allowlist-module/module.js";
export { NativeTokenLimitModule } from "./ma-v2/modules/native-token-limit-module/module.js";
export { PaymasterGuardModule } from "./ma-v2/modules/paymaster-guard-module/module.js";
export { SingleSignerValidationModule } from "./ma-v2/modules/single-signer-validation/module.js";
export { TimeRangeModule } from "./ma-v2/modules/time-range-module/module.js";
export { WebAuthnValidationModule } from "./ma-v2/modules/webauthn-validation/module.js";

export type * from "./ma-v2/permissionBuilder.js";
export {
  PermissionBuilder,
  PermissionType,
} from "./ma-v2/permissionBuilder.js";

export type * from "./ma-v2/predictAddress.js";
export { predictModularAccountV2Address } from "./ma-v2/predictAddress.js";

export type * from "./ma-v2/types.js";

export type * from "./ma-v2/utils/account.js";
export {
  DefaultAddress,
  DefaultModuleAddress,
  DEFAULT_OWNER_ENTITY_ID,
  EXECUTE_USER_OP_SELECTOR,
  getMAV2UpgradeToData,
  buildFullNonceKey,
  serializeModuleEntity,
  isModularAccountV2,
} from "./ma-v2/utils/account.js";

export type * from "./ma-v2/utils/deferredActions.js";
export {
  parseDeferredAction,
  buildDeferredActionDigest,
} from "./ma-v2/utils/deferredActions.js";

export type * from "./ma-v2/utils/hooks.js";
export {
  serializeValidationConfig,
  serializeHookConfig,
} from "./ma-v2/utils/hooks.js";

export type * from "./ma-v2/utils/signature.js";
export {
  packUOSignature,
  pack1271Signature,
  toReplaySafeTypedData,
  toWebAuthnSignature,
} from "./ma-v2/utils/signature.js";

// Errors.
export { EntityIdOverrideError } from "./errors/EntityIdOverrideError.js";
export { InvalidDeferredActionNonceError } from "./errors/InvalidDeferredActionNonceError.js";
export { InvalidEntityIdError } from "./errors/InvalidEntityIdError.js";
export { InvalidNonceKeyError } from "./errors/InvalidNonceKeyError.js";
export { InvalidOwnerError } from "./errors/InvalidOwnerError.js";
export {
  PermissionBuilderError,
  RootPermissionOnlyError,
  AccountAddressAsTargetError,
  DuplicateTargetAddressError,
  NoFunctionsProvidedError,
  ExpiredDeadlineError,
  DeadlineOverLimitError,
  ValidationConfigUnsetError,
  MultipleNativeTokenTransferError,
  ZeroAddressError,
  MultipleGasLimitError,
  UnsupportedPermissionTypeError,
  SelectorNotAllowed,
} from "./errors/permissionBuilderErrors.js";
