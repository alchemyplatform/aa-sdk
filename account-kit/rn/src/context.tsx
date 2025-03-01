import type {
  AlchemyAccountsConfig,
  AlchemyClientState,
} from "@account-kit/core";
import { AlchemyAccountContext } from "@account-kit/react/alchemy-account-context";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Hydrate } from "./hydrate.js";

export type AlchemyAccountContextProps = {
  config: AlchemyAccountsConfig;
  queryClient: QueryClient;
};

export type AlchemyAccountsProviderProps = {
  config: AlchemyAccountsConfig;
  initialState?: AlchemyClientState;
  queryClient: QueryClient;
};

/**
 * Provider for Alchemy accounts.
 *
 * @example
 * ```tsx
 * import { AlchemyAccountProvider, createConfig } from "@account-kit/react";
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
