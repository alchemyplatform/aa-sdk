import type { AuthMethods } from "@account-kit/signer";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { UseUserResult } from "./useUser";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { useUser } from "./useUser.js";
import { useSigner } from "./useSigner.js";
import { useSignerStatus } from "./useSignerStatus.js";

/**
 * A hook to list the authentication methods for a user.
 *
 * @returns {UseQueryResult<AuthMethods>} The authentication methods for the user.
 */
export const useListAuthMethods = (): UseQueryResult<AuthMethods> => {
  const { queryClient } = useAlchemyAccountContext();
  const user = useUser();
  const signer = useSigner();
  const { isConnected: isSignerConnected } = useSignerStatus();

  return useQuery(
    {
      queryKey: getListAuthMethodsQueryKey(user),
      queryFn: async (): Promise<AuthMethods> => {
        if (!signer || !isSignerConnected) {
          throw new Error("Signer not connected");
        }
        return signer.listAuthMethods();
      },
      enabled: !!user && !!signer && isSignerConnected,
    },
    queryClient,
  );
};

export const getListAuthMethodsQueryKey = (user: UseUserResult) => [
  "list-auth-methods",
  user?.orgId,
];
