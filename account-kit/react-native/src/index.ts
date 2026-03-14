import "react-native-get-random-values";
// Add Polyfills & global shims
import "./polyfills/index.js";
import "node-libs-react-native/globals.js";

export {
  useAccount,
  useAddOauthProvider,
  useAddPasskey,
  useAuthenticate,
  useAuthError,
  useBundlerClient,
  useChain,
  useConnection,
  useDropAndReplaceUserOperation,
  useExportAccount,
  useListAuthMethods,
  useLogout,
  useRemoveEmail,
  useRemoveOauthProvider,
  useRemovePasskey,
  useSendUserOperation,
  useSendVerificationCode,
  useSetEmail,
  useSigner,
  useSignerStatus,
  useSignMessage,
  useSignTypedData,
  useSmartAccountClient,
  useSolanaConnection,
  useSolanaSigner,
  useSolanaTransaction,
  useSolanaWallet,
  useUser,
  useWaitForUserOperationTransaction,
} from "@account-kit/react/hooks";
export type * from "@account-kit/react/hooks";
export * from "./context.js";
export { createConfig } from "./createConfig.js";
