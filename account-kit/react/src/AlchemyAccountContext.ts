"use client";

import type { AlchemyAccountsConfig } from "@account-kit/core";
import { type QueryClient } from "@tanstack/react-query";
import { createContext } from "react";

export type AlchemyAccountContextProps = {
  config: AlchemyAccountsConfig;
  queryClient: QueryClient;
};

export const AlchemyAccountContext = createContext<
  AlchemyAccountContextProps | undefined
>(undefined);
