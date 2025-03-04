import {
  useAuthenticate as useWebAuthenticate,
  type UseAuthenticateMutationArgs,
  type UseAuthenticateResult,
} from "@account-kit/react/hooks";

export const useAuthenticate = (
  mutationArgs?: UseAuthenticateMutationArgs
): UseAuthenticateResult => useWebAuthenticate(mutationArgs);
