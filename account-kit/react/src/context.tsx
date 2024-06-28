"use client";

import type { NoUndefined } from "@aa-sdk/core";
import type {
  AlchemyAccountsConfig,
  AlchemyClientState,
} from "@account-kit/core";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthCardProps } from "./components/auth/card/index.js";
import { AuthModalContext, type AuthStep } from "./components/auth/context.js";
import { AuthModal } from "./components/auth/modal.js";
import { IS_SIGNUP_QP } from "./components/constants.js";
import { NoAlchemyAccountContextError } from "./errors.js";
import { useSignerStatus } from "./hooks/useSignerStatus.js";
import { Hydrate } from "./hydrate.js";

export type AlchemyAccountContextProps =
  | {
      config: AlchemyAccountsConfig;
      queryClient: QueryClient;
      ui?: {
        openAuthModal: () => void;
        closeAuthModal: () => void;
      };
    }
  | undefined;

export const AlchemyAccountContext = createContext<
  AlchemyAccountContextProps | undefined
>(undefined);

export type AlchemyAccountsUIConfig = {
  auth?: AuthCardProps & { addPasskeyOnSignup?: boolean };
  /**
   * If hideError is true, then the auth component will not
   * render the global error component
   */
  hideError?: boolean;
};

export type AlchemyAccountsProviderProps = {
  config: AlchemyAccountsConfig;
  initialState?: AlchemyClientState;
  queryClient: QueryClient;
  /**
   * If auth config is provided, then the auth modal will be added
   * to the DOM and can be controlled via the `useAuthModal` hook
   */
  uiConfig?: AlchemyAccountsUIConfig;
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
): NoUndefined<AlchemyAccountContextProps> => {
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
  const { config, queryClient, children, uiConfig } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsModalOpen(false), []);

  const initialContext = useMemo(
    () => ({
      config,
      queryClient,
      ui: uiConfig
        ? {
            openAuthModal,
            closeAuthModal,
          }
        : undefined,
    }),
    [config, queryClient, uiConfig, openAuthModal, closeAuthModal]
  );

  const { status, isAuthenticating } = useSignerStatus(initialContext);
  const [authStep, setAuthStep] = useState<AuthStep>({
    type: isAuthenticating ? "email_completing" : "initial",
  });

  useEffect(() => {
    if (
      status === "AWAITING_EMAIL_AUTH" &&
      uiConfig?.auth?.addPasskeyOnSignup
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get(IS_SIGNUP_QP) !== "true") return;

      openAuthModal();
    }
  }, [status, uiConfig?.auth, openAuthModal]);

  return (
    <Hydrate {...props}>
      <AlchemyAccountContext.Provider value={initialContext}>
        <QueryClientProvider client={queryClient}>
          <AuthModalContext.Provider
            value={{
              authStep,
              setAuthStep,
            }}
          >
            {children}
            {uiConfig?.auth && (
              <AuthModal
                open={isModalOpen}
                auth={uiConfig.auth}
                hideError={uiConfig.hideError}
              />
            )}
          </AuthModalContext.Provider>
        </QueryClientProvider>
      </AlchemyAccountContext.Provider>
    </Hydrate>
  );
};
