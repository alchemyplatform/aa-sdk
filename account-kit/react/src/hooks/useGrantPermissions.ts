"use client";

import { AccountNotFoundError, clientHeaderTrack } from "@aa-sdk/core";
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
} from "../errors.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { ReactLogger } from "../metrics.js";
import type { UseSmartAccountClientResult } from "./useSmartAccountClient.js";
import { useSmartWalletClient } from "./useSmartWalletClient.js";

export type UseGrantPermissionsParams = {
  client: UseSmartAccountClientResult["client"] | undefined;
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

/**
 * React hook for granting permissions on the smart account to a given keypair
 * This enables dapps to request specific permissions from smart accounts, such as spending limits or execution permissions.
 * Returns an error if called with an EOA wallet connection.
 *
 * @example
 * ```tsx
 * import { useGrantPermissions, useSmartAccountClient } from "@account-kit/react";
 *
 * function PermissionsComponent() {
 *   const { client } = useSmartAccountClient({});
 *   const {
 *     grantPermissions,
 *     isGrantingPermissions,
 *   } = useGrantPermissions({ client });
 *
 *   const handleGrantPermissions = () => {
 *     grantPermissions({
 *       permissions: [
 *         {
 *           type: "native-token-spending-limit",
 *           data: {
 *             amount: "1000000000000000000", // 1 ETH in wei
 *           },
 *         },
 *       ],
 *       expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
 *     });
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleGrantPermissions}
 *       disabled={isGrantingPermissions}
 *     >
 *       {isGrantingPermissions ? "Granting..." : "Grant Permissions"}
 *     </button>
 *   );
 * }
 * ```
 *
 * @param {UseGrantPermissionsParams} params Configuration object containing the smart account client
 * @returns {UseGrantPermissionsResult} Object containing mutation functions, loading state, result, and error
 */
export function useGrantPermissions(
  params: UseGrantPermissionsParams,
): UseGrantPermissionsResult {
  const {
    queryClient,
    config: {
      _internal: { wagmiConfig },
    },
  } = useAlchemyAccountContext();
  const smartWalletClient = useSmartWalletClient({
    account: params.client?.account.address,
  });
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

        if (!smartWalletClient) {
          throw new ClientUndefinedHookError("useGrantPermissions");
        }

        if (!smartWalletClient.account) {
          throw new AccountNotFoundError();
        }

        const _smartWalletClient = clientHeaderTrack(
          smartWalletClient,
          "reactUseGrantPermissions",
        );

        return _smartWalletClient.grantPermissions(params);
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
