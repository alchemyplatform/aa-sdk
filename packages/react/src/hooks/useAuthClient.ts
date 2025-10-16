"use client";

import { useConfig } from "wagmi";
import { getAuthClient } from "@alchemy/wagmi-core";
import type { AuthClient } from "@alchemy/auth";
import type { ConfigParameter } from "../types";

export type UseAuthClientParameters = ConfigParameter;

export type UseAuthClientReturnType = AuthClient;

/**
 * React hook that returns the AuthClient instance.
 *
 * The AuthClient provides methods for authentication operations like logging in,
 * managing sessions, and user operations. This is a stable reference that doesn't
 * change, so it doesn't need reactivity.
 *
 * @param {UseAuthClientParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @returns {AuthClient} The AuthClient instance
 *
 * @example
 * ```tsx twoslash
 * import { useAuthClient } from '@alchemy/react';
 *
 * function AuthOperations() {
 *   const authClient = useAuthClient();
 *
 *   const handleLogin = async () => {
 *     await authClient.loginWithEmail({
 *       email: "user@example.com"
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleLogin}>
 *       Login with Email
 *     </button>
 *   );
 * }
 * ```
 */
export function useAuthClient(
  parameters: UseAuthClientParameters = {},
): UseAuthClientReturnType {
  const config = useConfig(parameters);
  return getAuthClient(config);
}
