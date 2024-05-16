"use client";

import { useSyncExternalStore } from "react";
import { useAccount as wagmi_useAccount } from "wagmi";
import { getUser } from "../../config/actions/getUser.js";
import { watchUser } from "../../config/actions/watchUser.js";
import type { User } from "../../signer/index.js";
import { useAlchemyAccountContext } from "../context.js";

export type UseUserResult = User | null;

export const useUser = (): UseUserResult => {
  const { config } = useAlchemyAccountContext();
  const account = wagmi_useAccount();
  const user = useSyncExternalStore(
    watchUser(config),
    () => getUser(config) ?? null,
    () => getUser(config) ?? null
  );

  if (account.status === "connected") {
    return {
      address: account.address,
      orgId: account.address,
      userId: account.address,
    };
  }

  return user;
};
