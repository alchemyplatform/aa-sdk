"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createContext, createElement, useContext } from "react";
import type { AlchemyAccountsConfig } from "../config";
import { NoAlchemyAccountContextError } from "./errors.js";

export type AlchemyAccountContextProps =
  | {
      config: AlchemyAccountsConfig;
      queryClient: QueryClient;
    }
  | undefined;

export const AlchemyAccountContext = createContext<
  AlchemyAccountContextProps | undefined
>(undefined);

export type AlchemyAccountsProviderProps = {
  config: AlchemyAccountsConfig;
  queryClient: QueryClient;
};

export const useAlchemyAccountContext = () => {
  const context = useContext(AlchemyAccountContext);

  if (context === undefined) {
    throw new NoAlchemyAccountContextError("useAlchemyAccountContext");
  }

  return context;
};

/**
 * Provider for Alchemy accounts.
 * @param config The Alchemy accounts configuration.
 * @param queryClient The query client.
 * @param children The children to render.
 * @returns The element to wrap your application in for Alchemy Accounts context.
 */
export const AlchemyAccountProvider = ({
  config,
  queryClient,
  children,
}: React.PropsWithChildren<AlchemyAccountsProviderProps>) => {
  // Note: we don't use .tsx because we don't wanna use rollup or similar to bundle this package.
  // This lets us continue to use TSC for building the packages which preserves the "use client" above
  return createElement(
    AlchemyAccountContext.Provider,
    { value: { config, queryClient } },
    children
  );
};
