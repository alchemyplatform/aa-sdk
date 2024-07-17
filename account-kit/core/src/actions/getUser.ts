import type { User } from "@account-kit/signer";
import type { AlchemyAccountsConfig } from "../types";

export type GetUserResult = (User & { type: "eoa" | "sca" }) | null;

/**
 * Returns the currently logged in user if using an SCA with the AlchemySigner
 * or the connected EOA details.
 *
 * @example
 * ```ts
 * import { getUser } from "@account-kit/core";
 * import { config } from "./config";
 *
 * const user = getUser(config);
 * ```
 *
 * @param {AlchemyAccountsConfig} config the account config containing app state
 * @returns {GetUserResult} the user if the signer or an EOA are connected
 */
export const getUser = (
  config: AlchemyAccountsConfig
): (User & { type: "eoa" | "sca" }) | null => {
  const user = config.store.getState().user;
  if (user == null) return user ?? null;

  // @ts-ignore
  user.type = "sca" as const;
  // @ts-ignore
  return user;
};
