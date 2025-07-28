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
  getLightAccountVersionForAccount,
  LightAccountUnsupported1271Factories,
  LightAccountUnsupported1271Impls,
} from "./light-account/utils.js";
