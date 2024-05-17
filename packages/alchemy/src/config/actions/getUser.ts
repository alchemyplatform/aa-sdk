import type { User } from "../../signer";
import type { AlchemyAccountsConfig } from "../types";

/**
 * Returns the currently logged in user if using an SCA with the AlchemySigner
 * or the connected EOA details.
 *
 * @param config the account config containing app state
 * @returns the user if the signer or an EOA are connected
 */
export const getUser = (
  config: AlchemyAccountsConfig
): (User & { type: "eoa" | "sca" }) | null => {
  const user = config.clientStore.getState().user;
  if (user == null) return user ?? null;

  // @ts-ignore
  user.type = "sca" as const;
  // @ts-ignore
  return user;
};
