import { type Config, watchAccount } from "@wagmi/core";
import type { User } from "@alchemy/auth";
import { getUser } from "./getUser.js";
import { getAuthSession } from "./getAuthSession.js";

export type WatchUserParameters = {
  /** Callback function that is called when user data changes */
  onChange: (user: User | null) => void;
};

export type WatchUserReturnType = () => void;

/**
 * Watches for changes to the authenticated user's data.
 *
 * This subscribes to both account connection changes and AuthSession's userUpdate event,
 * calling the onChange callback whenever the user data changes (e.g., on connect/disconnect,
 * email/phone updates, or other profile changes).
 *
 * Returns an unsubscribe function to stop watching.
 *
 * @param {Config} config - The shared Wagmi/Alchemy config
 * @param {WatchUserParameters} parameters - Watch parameters
 * @param {Function} parameters.onChange - Callback called when user changes
 * @returns {Function} Unsubscribe function to stop watching
 *
 * @example
 * ```ts
 * const unwatch = watchUser(config, {
 *   onChange(user) {
 *     if (user) {
 *       console.log("User updated:", user.address);
 *     } else {
 *       console.log("User disconnected");
 *     }
 *   }
 * });
 *
 * // Later, stop watching
 * unwatch();
 * ```
 */
export function watchUser(
  config: Config,
  parameters: WatchUserParameters,
): WatchUserReturnType {
  const { onChange } = parameters;

  let authSessionUnsubscribe: (() => void) | undefined;

  // Watch for account changes
  const unwatchAccount = watchAccount(config, {
    onChange(account) {
      // Clean up previous AuthSession listener
      authSessionUnsubscribe?.();
      authSessionUnsubscribe = undefined;

      if (account.status === "connected") {
        try {
          const user = getUser(config);
          onChange(user);

          // Subscribe to AuthSession userUpdate events
          const authSession = getAuthSession(config);
          if (authSession) {
            authSessionUnsubscribe = authSession.on(
              "userUpdate",
              (updatedUser) => {
                onChange(updatedUser);
              },
            );
          }
        } catch {
          // No auth session, emit null
          onChange(null);
        }
      } else {
        onChange(null);
      }
    },
  });

  return () => {
    unwatchAccount();
    authSessionUnsubscribe?.();
  };
}
