import "./polyfills/index.js";
import {
  AlchemyAccountContext,
  NoAlchemyAccountContextError,
  type AlchemyAccountContextProps,
} from "@account-kit/react";
import { Hydrate } from "./hydrate.js";
import { useContext, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RNAlchemySignerType } from "../../rn-signer/lib/typescript/module/src/signer.js";
import type {
  AlchemyAccountsConfig,
  AlchemyClientState,
} from "@account-kit/core";

export type AlchemyAccountsProviderProps = {
  config: AlchemyAccountsConfig<RNAlchemySignerType>;
  initialState?: AlchemyClientState<RNAlchemySignerType>;
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
  override?: AlchemyAccountContextProps<RNAlchemySignerType>
): AlchemyAccountContextProps<RNAlchemySignerType> => {
  const context = useContext(AlchemyAccountContext);
  if (override != null) return override;

  if (context == null) {
    throw new NoAlchemyAccountContextError("useAlchemyAccountContext");
  }

  return context;
};
