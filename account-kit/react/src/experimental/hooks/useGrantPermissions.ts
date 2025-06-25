import { clientHeaderTrack } from "@aa-sdk/core";
import type { GetSmartWalletClientResult } from "@account-kit/core/experimental";
import type { SmartWalletClient } from "@account-kit/wallet-client";
import {
  useMutation,
  type UseMutateAsyncFunction,
  type UseMutateFunction,
} from "@tanstack/react-query";
import { type Address, type Prettify } from "viem";
import { useAccount as wagmi_useAccount } from "wagmi";
import {
  ClientUndefinedHookError,
  UnsupportedEOAActionError,
} from "../../errors.js";
import { useAlchemyAccountContext } from "../../hooks/useAlchemyAccountContext.js";
import { ReactLogger } from "../../metrics.js";

export type UseGrantPermissionsParams = {
  client?: GetSmartWalletClientResult<Address>;
};

type MutationParams = Prettify<
  Omit<
    Parameters<SmartWalletClient<Address>["grantPermissions"]>[0],
    "entityId" | "account"
  >
>;

type MutationResult = Awaited<
  ReturnType<SmartWalletClient<Address>["grantPermissions"]>
>;

export type UseGrantPermissionsResult = {
  grantPermissions: UseMutateFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  grantPermissionsAsync: UseMutateAsyncFunction<
    MutationResult,
    Error,
    MutationParams,
    unknown
  >;
  grantPermissionsResult: MutationResult | undefined;
  isGrantingPermissions: boolean;
  error: Error | null;
};

export function useGrantPermissions(
  params: UseGrantPermissionsParams,
): UseGrantPermissionsResult {
  const { client: _client } = params;
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const { isConnected } = wagmi_useAccount({ config: wagmiConfig });

  const {
    mutate: grantPermissions,
    mutateAsync: grantPermissionsAsync,
    data: grantPermissionsResult,
    isPending: isGrantingPermissions,
    error,
  } = useMutation(
    {
      mutationFn: async (params: MutationParams): Promise<MutationResult> => {
        if (isConnected) {
          throw new UnsupportedEOAActionError("useGrantPermissions", "mutate");
        }

        if (!_client) {
          throw new ClientUndefinedHookError("useGrantPermissions");
        }

        const client = clientHeaderTrack(_client, "reactUseGrantPermissions");

        return client.grantPermissions(params);
      },
    },
    queryClient,
  );

  return {
    grantPermissions: ReactLogger.profiled(
      "grantPermissions",
      grantPermissions,
    ),
    grantPermissionsAsync: ReactLogger.profiled(
      "grantPermissionsAsync",
      grantPermissionsAsync,
    ),
    grantPermissionsResult,
    isGrantingPermissions,
    error,
  };
}
