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
 * **Advanced usage only.** For most use cases, use higher-level hooks instead.
 * If you just need user info, use `useUser()` instead.
 *
 * @param {UseAuthSessionParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @returns {AuthSession | null} The current auth session, or null if not authenticated
 */
export function useAuthSession(
  parameters: UseAuthSessionParameters = {},
): UseAuthSessionReturnType {
  const config = useConfig(parameters);

  const authSession = useSyncExternalStore(
    (onChange) => {
      let disconnectUnsubscribe: (() => void) | undefined;

      // Subscribe to account status changes
      const unwatchAccount = config.subscribe(
        (state) => state.status,
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
