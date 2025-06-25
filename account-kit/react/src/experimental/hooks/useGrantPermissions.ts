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

/**
 * React hook for granting permissions to session keys on smart accounts.
 *
 * This hook provides functionality to create session keys with specific permissions
 * that allows other signers to operate on a user's smart account with granular access.
 *
 * @example
 * ```tsx
 * import { useGrantPermissions } from "@account-kit/react/experimental";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 *
 * function GrantPermissionsComponent() {
 *   const { grantPermissionsAsync, isGrantingPermissions, error } = useGrantPermissions({
 *     client: smartWalletClient
 *   });
 *
 *   const handleGrantPermissions = async () => {
 *     try {
 *       // Generate a session key
 *       const sessionKey = LocalAccountSigner.generatePrivateKeySigner();
 *
 *       const permissions = await grantPermissionsAsync({
 *         expirySec: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
 *         key: {
 *           publicKey: await sessionKey.getAddress(),
 *           type: "secp256k1",
 *         },
 *         permissions: [
 *           {
 *             type: "root", // root permissions (full access)
 *           },
 *         ],
 *       });
 *
 *       console.log("Permissions granted:", permissions);
 *     } catch (err) {
 *       console.error("Failed to grant permissions:", err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={handleGrantPermissions}
 *         disabled={isGrantingPermissions}
 *       >
 *         {isGrantingPermissions ? "Granting..." : "Grant Permissions"}
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @param {UseGrantPermissionsParams} params - Configuration parameters for the hook
 * @param {GetSmartWalletClientResult<Address>} [params.client] - Smart wallet client instance
 *
 * @returns {UseGrantPermissionsResult} An object containing:
 * - `grantPermissions`: Function to trigger the permission granting mutation
 * - `grantPermissionsAsync`: Async function to grant permissions and return the result
 * - `grantPermissionsResult`: The result of the last successful permission grant operation
 * - `isGrantingPermissions`: Boolean indicating if a permission grant operation is in progress
 * - `error`: Error object if the last operation failed
 */
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
