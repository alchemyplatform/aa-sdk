"use client";

import { useSyncExternalStore } from "react";
import { useConfig } from "wagmi";
import { getUser, watchUser } from "@alchemy/wagmi-core";
import type { User } from "@alchemy/auth";
import type { ConfigParameter } from "../types";

export type UseUserParameters = ConfigParameter;

export type UseUserReturnType = User | null;

/**
 * React hook that returns the current authenticated user's data.
 *
 * This hook uses useSyncExternalStore to subscribe to user changes and
 * automatically updates when the user connects, disconnects, or updates their profile.
 *
 * Returns null if no user is authenticated.
 *
 * TODO(jh): Consider if this should use a wagmi query pattern instead of useSyncExternalStore.
 * The current approach is based on the principle that user data is managed by the auth session
 * and should always exist without a fetch once a user is logged in.
 *
 * @param {UseUserParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @returns {User | null} The current user object, or null if not authenticated
 *
 * @example
 * ```tsx twoslash
 * import { useUser } from '@alchemy/react';
 *
 * function UserProfile() {
 *   const user = useUser();
 *
 *   if (!user) {
 *     return <div>Not logged in</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Address: {user.address}</p>
 *       <p>Email: {user.email}</p>
 *       <p>Phone: {user.phone}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUser(parameters: UseUserParameters = {}): UseUserReturnType {
  const config = useConfig(parameters);

  const user = useSyncExternalStore(
    (onChange) => {
      return watchUser(config, {
        onChange,
      });
    },
    () => {
      try {
        return getUser(config);
      } catch {
        return null;
      }
    },
    () => null, // Server-side rendering: always return null
  );

  return user;
}
