"use client";

import { useSyncExternalStore } from "react";
import { useConfig } from "wagmi";
import { getAuthSession } from "@alchemy/wagmi-core";
import type { AuthSession } from "@alchemy/auth";
import type { ConfigParameter } from "../types";

export type UseAuthSessionParameters = ConfigParameter;

export type UseAuthSessionReturnType = AuthSession | null;

/**
 * React hook that returns the current authentication session.
 *
 * This hook uses useSyncExternalStore to subscribe to auth session changes and
 * automatically updates when the user connects or disconnects.
 *
 * Returns null if no authentication session exists.
 *
 * @param {UseAuthSessionParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @returns {AuthSession | null} The current auth session, or null if not authenticated
 *
 * @example
 * ```tsx twoslash
 * import { useAuthSession } from '@alchemy/react';
 *
 * function SessionInfo() {
 *   const authSession = useAuthSession();
 *
 *   if (!authSession) {
 *     return <div>No active session</div>;
 *   }
 *
 *   const user = authSession.getUser();
 *   const expiresAt = new Date(authSession.getExpirationDateMs());
 *
 *   return (
 *     <div>
 *       <p>Logged in as: {user.address}</p>
 *       <p>Session expires: {expiresAt.toLocaleString()}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthSession(
  parameters: UseAuthSessionParameters = {},
): UseAuthSessionReturnType {
  const config = useConfig(parameters);

  const authSession = useSyncExternalStore(
    (onChange) => {
      let disconnectUnsubscribe: (() => void) | undefined;

      // Subscribe to account/connection changes
      const unwatchAccount = config.subscribe(
        (state) => ({
          connections: state.connections,
          current: state.current,
        }),
        () => {
          onChange();

          // Clean up old listener
          disconnectUnsubscribe?.();
          disconnectUnsubscribe = undefined;

          // Subscribe to new AuthSession's disconnect event
          const session = getAuthSession(config);
          if (session) {
            disconnectUnsubscribe = session.on("disconnect", () => {
              onChange();
            });
          }
        },
        {
          equalityFn: (a, b) =>
            a.connections === b.connections && a.current === b.current,
        },
      );

      // Subscribe to disconnect event for initial session
      const initialSession = getAuthSession(config);
      if (initialSession) {
        disconnectUnsubscribe = initialSession.on("disconnect", () => {
          onChange();
        });
      }

      return () => {
        unwatchAccount();
        disconnectUnsubscribe?.();
      };
    },
    () => getAuthSession(config),
    () => null, // Server-side rendering: always return null
  );

  return authSession;
}
