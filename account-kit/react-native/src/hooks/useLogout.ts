import {
  useLogout as useWebLogout,
  type UseLogoutMutationArgs,
  type UseLogoutResult,
} from "@account-kit/react/hooks";

export const useLogout = (
  mutationArgs?: UseLogoutMutationArgs
): UseLogoutResult => useWebLogout(mutationArgs);
