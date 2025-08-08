export { cookieStorage, type CreateConfigProps } from "@account-kit/core";
export type * from "./AlchemyAccountProvider.js";
export { AlchemyAccountProvider } from "./AlchemyAccountProvider.js";
export type * from "./AlchemyAccountContext.js";
export { AlchemyAccountContext } from "./AlchemyAccountContext.js";
export {
  createConfig,
  type AlchemyAccountsConfigWithUI,
} from "./createConfig.js";
export { NoAlchemyAccountContextError } from "./errors.js";

// Hooks
export { useAlchemyAccountContext } from "./hooks/useAlchemyAccountContext.js";
export type * from "./hooks/useAccount.js";
export { useAccount } from "./hooks/useAccount.js";
export type * from "./hooks/useAddOauthProvider.js";
export { useAddOauthProvider } from "./hooks/useAddOauthProvider.js";
export type * from "./hooks/useAddPasskey.js";
export { useAddPasskey } from "./hooks/useAddPasskey.js";
export type * from "./hooks/useAuthenticate.js";
export { useAuthenticate } from "./hooks/useAuthenticate.js";
export type * from "./hooks/useAuthError.js";
export { useAuthError } from "./hooks/useAuthError.js";
export type * from "./hooks/useBundlerClient.js";
export { useBundlerClient } from "./hooks/useBundlerClient.js";
export type * from "./hooks/useChain.js";
export { useChain } from "./hooks/useChain.js";
export type * from "./hooks/useClientActions.js";
export { useClientActions } from "./hooks/useClientActions.js";
export type * from "./hooks/useConnect.js";
export { useConnect } from "./hooks/useConnect.js";
export type * from "./hooks/useConnection.js";
export { useConnection } from "./hooks/useConnection.js";
export type * from "./hooks/useDropAndReplaceUserOperation.js";
export { useDropAndReplaceUserOperation } from "./hooks/useDropAndReplaceUserOperation.js";
export type * from "./hooks/useExportAccount.js";
export { useExportAccount } from "./hooks/useExportAccount.js";
export type * from "./hooks/useListAuthMethods.js";
export { useListAuthMethods } from "./hooks/useListAuthMethods.js";
export type * from "./hooks/useLogout.js";
export { useLogout } from "./hooks/useLogout.js";
export type * from "./hooks/useMFA.js";
export { useMFA } from "./hooks/useMFA.js";
export type * from "./hooks/useRemoveEmail.js";
export { useRemoveEmail } from "./hooks/useRemoveEmail.js";
export type * from "./hooks/useRemoveOauthProvider.js";
export { useRemoveOauthProvider } from "./hooks/useRemoveOauthProvider.js";
export type * from "./hooks/useRemovePasskey.js";
export { useRemovePasskey } from "./hooks/useRemovePasskey.js";
export type * from "./hooks/useSendUserOperation.js";
export { useSendUserOperation } from "./hooks/useSendUserOperation.js";
export type * from "./hooks/useSetEmail.js";
export { useSetEmail } from "./hooks/useSetEmail.js";
export type * from "./hooks/useSigner.js";
export { useSigner } from "./hooks/useSigner.js";
export type * from "./hooks/useSignerStatus.js";
export { useSignerStatus } from "./hooks/useSignerStatus.js";
export type * from "./hooks/useSignMessage.js";
export { useSignMessage } from "./hooks/useSignMessage.js";
export type * from "./hooks/useSignTypedData.js";
export { useSignTypedData } from "./hooks/useSignTypedData.js";
export type * from "./hooks/useSmartAccountClient.js";
export { useSmartAccountClient } from "./hooks/useSmartAccountClient.js";
export type * from "./hooks/useUiConfig.js";
export { DEFAULT_UI_CONFIG, useUiConfig } from "./hooks/useUiConfig.js";
export type * from "./hooks/useUser.js";
export { useUser } from "./hooks/useUser.js";
export type * from "./hooks/useWaitForUserOperationTransaction.js";
export { useWaitForUserOperationTransaction } from "./hooks/useWaitForUserOperationTransaction.js";
export { type AlchemyAccountsUIConfig } from "./types.js";
export { Dialog } from "./components/dialog/dialog.js";

// These are the actual components that should be exported later
export { AuthCard } from "./components/auth/card/index.js";
export type * from "./components/auth/types.js";
export { useAuthModal } from "./hooks/useAuthModal.js";
export { useAuthContext } from "./components/auth/context.js";
export { Hydrate } from "./hydrate.js";
export {
  useSolanaTransaction,
  type SolanaTransaction,
} from "./hooks/useSolanaTransaction.js";
export {
  useSolanaConnection,
  type SolanaConnection,
} from "./hooks/useSolanaConnection.js";

export { useSolanaSignMessage } from "./hooks/useSolanaSignMessage.js";

export {
  configForExternalWallets,
  type ExternalWalletConfig,
  type SupportedWallet,
  type ChainType,
  type ExternalWalletUIConfig,
  type ConfigForExternalWalletsParams,
} from "./configForExternalWallets.js";
