"use client";

import { useSyncExternalStore } from "react";
import { getUser } from "../../config/actions/getUser.js";
import { watchUser } from "../../config/actions/watchUser.js";
import type { User } from "../../signer/index.js";
import { useAlchemyAccountContext } from "../context.js";

export type UseUserResult = User | null;

export const useUser = (): UseUserResult => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchUser(config),
    () => getUser(config) ?? null,
    () => null
  );
};
