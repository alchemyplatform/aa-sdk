"use client";

import type {
  AlchemyAccountsConfig,
  AlchemyClientState,
} from "@account-kit/core";
import { AlchemySignerStatus } from "@account-kit/signer";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthModalContext,
  AuthStepType,
  type AuthStep,
} from "./components/auth/context.js";
import { AuthModal } from "./components/auth/modal.js";
import { IS_SIGNUP_QP } from "./components/constants.js";
import type { AlchemyAccountsConfigWithUI } from "./createConfig.js";
import { NoAlchemyAccountContextError } from "./errors.js";
import { useSignerStatus } from "./hooks/useSignerStatus.js";
import { UiConfigProvider } from "./hooks/useUiConfig.js";
import { Hydrate } from "./hydrate.js";

export type AlchemyAccountContextProps = {
  config: AlchemyAccountsConfig;
  queryClient: QueryClient;
};

export const AlchemyAccountContext = createContext<
  AlchemyAccountContextProps | undefined
>(undefined);

export type AlchemyAccountsProviderProps = {
  config: AlchemyAccountsConfigWithUI;
  initialState?: AlchemyClientState;
  queryClient: QueryClient;
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
  const context = useContext(AlchemyAccountContext);
  if (override != null) return override;

  if (context == null) {
    throw new NoAlchemyAccountContextError("useAlchemyAccountContext");
  }

  return context;
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

  const clearSignupParam = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete(IS_SIGNUP_QP);
    window.history.replaceState(window.history.state, "", url.toString());
  };

  /**
   * Reset the auth step to the initial state. This also clears the email auth query params from the URL.
   */
  const resetAuthStep = useCallback(() => {
    setAuthStep({ type: AuthStepType.initial });

    clearSignupParam();
  }, []);

  const initialContext = useMemo(
    () => ({
      config,
      queryClient,
    }),
    [config, queryClient]
  );

  const { status } = useSignerStatus(initialContext);

  const [authStep, setAuthStep] = useState<AuthStep>(() => {
    if (status === AlchemySignerStatus.AUTHENTICATING_EMAIL) {
      return {
        type: AuthStepType.email_completing,
      };
    }

    return {
      type: AuthStepType.initial,
    };
  });

  useEffect(() => {
    if (authStep.type === AuthStepType.complete) {
      clearSignupParam();
    }
  }, [authStep]);

  return (
    <Hydrate {...props}>
      <AlchemyAccountContext.Provider value={initialContext}>
        <QueryClientProvider client={queryClient}>
          {config.ui ? (
            <UiConfigProvider initialConfig={config.ui}>
              <AuthModalContext.Provider
                value={{
                  authStep,
                  setAuthStep,
                  resetAuthStep,
                }}
              >
                {children}
                <AuthModal />
              </AuthModalContext.Provider>
            </UiConfigProvider>
          ) : (
            children
          )}
        </QueryClientProvider>
      </AlchemyAccountContext.Provider>
    </Hydrate>
  );
};
