"use client";

import { getUser, watchUser } from "@account-kit/core";
import type { User } from "@account-kit/signer";
import { useMemo, useSyncExternalStore } from "react";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "../context.js";
import type { Address } from "@aa-sdk/core";

export type UseUserResult =
  | (User & { type: "eoa" | "sca"; loading?: never })
  | null
  | { address?: Address; type: "eoa" | "sca"; loading: true };

/**
 * A React hook that returns the current user information, either from an External Owned Account (EOA) or from the client store. It uses the Alchemy account context and synchronizes with external store updates.
 *
 * @example
 * ```ts
 * import { useUser } from "@account-kit/react";
 *
 * const user = useUser();
 * ```
 *
 * @returns {UseUserResult} The user information, including address, orgId, userId, and type. If the user is not connected, it returns null.
 */
export const useUser = (): UseUserResult => {
  const { config } = useAlchemyAccountContext();
  const {
    _internal: { wagmiConfig },
  } = config;

  const account = wagmi_useAccount({ config: wagmiConfig });
  const user = useSyncExternalStore(
    watchUser(config),
    () => getUser(config) ?? null,
    () => getUser(config) ?? null
  );
  const eoaUser = useMemo(() => {
    if (account.status !== "connected" && account.status !== "reconnecting") {
      return null;
    } else if (account.status == "reconnecting") {
      //return user info for "reconnecting" status
      return {
        address: account.address,
        type: "eoa" as const,
        loading: true as const,
      };
    }

    if (!account.address) {
      return null;
    }

    return {
      address: account.address,
      // for backwards compat
      // TODO: when we upgrade to v4 we should fix this with a breaking change
      orgId: account.address,
      userId: account.address,
      type: "eoa" as const,
    };
  }, [account.address, account.status]);

  if (eoaUser) return eoaUser;

  return user;
};
