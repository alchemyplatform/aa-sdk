"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useAccount as wagmi_useAccount } from "wagmi";
import { getUser } from "../../config/actions/getUser.js";
import { watchUser } from "../../config/actions/watchUser.js";
import type { User } from "../../signer/index.js";
import { useAlchemyAccountContext } from "../context.js";

export type UseUserResult = (User & { type: "eoa" | "sca" }) | null;

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
    if (account.status !== "connected") {
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
