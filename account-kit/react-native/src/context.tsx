import "./polyfills/buffer-polyfill.js";
import "./polyfills/custom-event-polyfill.js";
import "./polyfills/window-polyfill.js";
import "./polyfills/mmkv-localstorage-polyfill.js";

import { Hydrate } from "./hydrate.js";
import { createContext, useContext, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  AlchemyAccountsConfig,
  AlchemyClientState,
  AlchemySigner,
} from "@account-kit/core";

export type AlchemyAccountContextProps = {
  config: AlchemyAccountsConfig<AlchemySigner>;
  queryClient: QueryClient;
};

export type AlchemyAccountsProviderProps = {
  config: AlchemyAccountsConfig<AlchemySigner>;
  initialState?: AlchemyClientState<AlchemySigner>;
  queryClient: QueryClient;
};

export const AlchemyAccountContext = createContext<
  AlchemyAccountContextProps | undefined
>(undefined);
/**
 * Provider for Alchemy accounts.
 *
 * @example
 * ```tsx
 * import { AlchemyAccountProvider, createConfig } from "@account-kit/react-native";
 * import { sepolia } from "@account-kit/infra";
 * import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 *
 * const config = createConfig({
 *  apiKey: "your-api-key",
 *  chain: sepolia,
 * });
 *
 * const queryClient = new QueryClient();
 *
 * function App({ children }: React.PropsWithChildren) {
 *  return (
 *    <QueryClientProvider queryClient={queryClient}>
 *      <AlchemyAccountProvider config={config} queryClient={queryClient}>
 *        {children}
 *      </AlchemyAccountProvider>
 *    </QueryClientProvider>
 *  );
 * }
 * ```
 *
 * @param {React.PropsWithChildren<AlchemyAccountsProviderProps>} props alchemy accounts provider props
 * @param {AlchemyAccountsConfig} props.config the acccount config generated using `createConfig`
 * @param {QueryClient} props.queryClient the react-query query client to use
 * @param {AlchemyAccountsUIConfig} props.uiConfig optional UI configuration
 * @param {React.ReactNode | undefined} props.children react components that should have this accounts context
 * @returns {React.JSX.Element} The element to wrap your application in for Alchemy Accounts context.
 */
export const AlchemyAccountProvider = (
  props: React.PropsWithChildren<AlchemyAccountsProviderProps>
) => {
  const { config, queryClient, children } = props;

  const initialContext = useMemo(
    () => ({
      config,
      queryClient,
    }),
    [config, queryClient]
  );

  return (
    <Hydrate {...props}>
      <AlchemyAccountContext.Provider value={initialContext}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AlchemyAccountContext.Provider>
    </Hydrate>
  );
};

/**
 * Internal Only hook used to access the alchemy account context.
 * This hook is meant to be consumed by other hooks exported by this package.
 *
 * @example
 * ```tsx
 * import { useAlchemyAccountContext } from "@account-kit/react";
 *
 * const { config, queryClient } = useAlchemyAccountContext();
 * ```
 *
 * @param {AlchemyAccountContextProps} override optional context override that can be used to return a custom context
 * @returns {AlchemyAccountContextProps} The alchemy account context if one exists
 * @throws if used outside of the AlchemyAccountProvider
 */
export const useAlchemyAccountContext = (
  override?: AlchemyAccountContextProps
): AlchemyAccountContextProps => {
  const context = useContext<AlchemyAccountContextProps | undefined>(
    AlchemyAccountContext
  );
  if (override != null) return override;

  if (context == null) {
    throw new Error(
      "useAlchemyAccountContext is not inside an AlchemyAccountProvider"
    );
  }

  return context;
};
