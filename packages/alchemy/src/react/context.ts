"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createContext, createElement, useContext } from "react";
import type { AlchemyAccountsConfig, AlchemyClientState } from "../config";
import { NoAlchemyAccountContextError } from "./errors.js";
import { Hydrate } from "./hydrate.js";

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
  initialState?: AlchemyClientState;
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
 *
 * @param props alchemy accounts provider props
 * @param props.config the acccount config generated using {@link createConfig}
 * @param props.queryClient the react-query query client to use
 * @param props.children react components that should have this accounts context
 * @returns The element to wrap your application in for Alchemy Accounts context.
 */
export const AlchemyAccountProvider = (
  props: React.PropsWithChildren<AlchemyAccountsProviderProps>
) => {
  const { config, queryClient, children } = props;
  // Note: we don't use .tsx because we don't wanna use rollup or similar to bundle this package.
  // This lets us continue to use TSC for building the packages which preserves the "use client" above
  return createElement(
    Hydrate,
    props,
    createElement(
      AlchemyAccountContext.Provider,
      { value: { config, queryClient } },
      children
    )
  );
};
