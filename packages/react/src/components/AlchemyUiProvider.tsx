"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { AuthModalContext, type AuthStep } from "./auth/context.js";
import { AuthModal } from "./auth/modal.js";
import { IS_SIGNUP_QP } from "./constants.js";
import { DEFAULT_UI_CONFIG, UiConfigProvider } from "../hooks/useUiConfig.js";
import { type QueryClient } from "@tanstack/react-query";
import type { AlchemyAccountsUIConfig } from "../types.js";

export type AlchemyUiProviderProps = {
  /** the react-query query client to use */
  queryClient: QueryClient;
  /** the UI configuration to use */
  ui?: AlchemyAccountsUIConfig;
};

/**
 * Provider for for Alchemy UI components. `AuthCard` and `AuthModal` can only be rendered within this provider.
 *
 * @example
 * ```tsx
 * import { AlchemyUiProvider, createConfig } from "@account-kit/react";
 * import { sepolia } from "@account-kit/infra";
 * import { QueryClient } from "@tanstack/react-query";
 * import { wagmiConfig } from "./wagmiConfig";
 *
 * const ui: AlchemyAccountsUIConfig = {
 *  illustrationStyle: "linear",
 *  auth: {
 *    sections: [[{ type: "email" }], [{ type: "social", authProviderId: "google", mode: "popup" }]],
 *  },
 * };
 *
 * const queryClient = new QueryClient();
 *
 * function App({ children }: React.PropsWithChildren) {
 *  return (
 *    <WagmiProvider config={wagmiConfig}>
 *      <AlchemyAccountProvider queryClient={queryClient} ui={ui}>
 *        {children}
 *      </AlchemyAccountProvider>
 *    </WagmiProvider>
 *  );
 * }
 * ```
 *
 * @param {React.PropsWithChildren<AlchemyUiProviderProps>} props alchemy accounts provider props
 * @param {QueryClient} props.queryClient the react-query query client to use
 * @param {AlchemyAccountsUIConfig} props.ui ui configuration to use
 * @param {React.ReactNode | undefined} props.children react components that should have this accounts context
 * @returns {React.JSX.Element} The element to wrap your application in for Alchemy UI context.
 */
export const AlchemyUiProvider = (
  props: React.PropsWithChildren<AlchemyUiProviderProps>,
) => {
  const { queryClient, ui = DEFAULT_UI_CONFIG, children } = props;

  const clearSignupParam = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete(IS_SIGNUP_QP);
    window.history.replaceState(window.history.state, "", url.toString());
  };

  /**
   * Reset the auth step to the initial state. This also clears the email auth query params from the URL.
   */
  const resetAuthStep = useCallback(() => {
    setAuthStep({ type: "initial" });

    clearSignupParam();
  }, []);

  const [authStep, setAuthStep] = useState<AuthStep>({ type: "initial" });

  useEffect(() => {
    if (authStep.type === "complete") {
      clearSignupParam();
    }
  }, [authStep]);

  return (
    <QueryClientProvider client={queryClient}>
      <UiConfigProvider initialConfig={ui}>
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
    </QueryClientProvider>
  );
};
