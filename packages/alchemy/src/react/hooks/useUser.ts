"use client";

import { useSyncExternalStore } from "react";
import { getUser } from "../../config/actions/getUser.js";
import { watchUser } from "../../config/actions/watchUser.js";
import { useAlchemyAccountContext } from "../context.js";

export const useUser = () => {
  const { config } = useAlchemyAccountContext();

  return useSyncExternalStore(
    watchUser(config),
    () => getUser(config),
    () => null
  );
};
