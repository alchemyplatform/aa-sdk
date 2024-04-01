import { createMultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { AlchemySigner } from "@alchemy/aa-alchemy";
import { createBundlerClient, optimismSepolia } from "@alchemy/aa-core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { custom, http } from "viem";

export const useAuthenticateUser = (signer: AlchemySigner | undefined) => {
  const params = useSearchParams();
  const router = useRouter();

  const authUser = useCallback(async () => {
    if (params.get("bundle") != null) {
      await signer!.authenticate({
        type: "email",
        bundle: params.get("bundle")!,
      });

      router.push("/");
    }

    const user = await signer!.getAuthDetails().catch(() => {
      return undefined;
    });

    const publicClient = createBundlerClient({
      chain: optimismSepolia,
      transport: http("/api/rpc"),
    });

    const account = user
      ? await createMultiOwnerModularAccount({
          transport: custom(publicClient),
          chain: optimismSepolia,
          signer: signer!,
        })
      : undefined;

    return { user, account };
  }, [params, signer, router]);

  const { mutate: authenticateUser, isPending: isAuthenticatingUser } =
    useMutation({
      mutationFn: signer?.authenticate,
      onSuccess: authUser,
    });

  const {
    data,
    isLoading: isLoadingUser,
    refetch: refetchUserDetails,
  } = useQuery({
    queryKey: ["user-details"],
    queryFn: authUser,
  });

  return {
    user: data?.user,
    account: data?.account,
    isLoadingUser,
    refetchUserDetails,
    isAuthenticatingUser,
    authenticateUser,
  };
};
