"use client";

import type {
  AlchemyAccountsConfig,
  AlchemyClientState,
} from "@account-kit/core";
import type { NoUndefined } from "@aa-sdk/core";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthModalContext, type AuthStep } from "./components/auth/context.js";
import { AuthModal } from "./components/auth/modal.js";
import { IS_SIGNUP_QP } from "./components/constants.js";
import { NoAlchemyAccountContextError } from "./errors.js";
import { useSignerStatus } from "./hooks/useSignerStatus.js";
import { Hydrate } from "./hydrate.js";
import type { AlchemyAccountsConfigWithUI } from "./createConfig.js";
import type { AlchemyAccountsUIConfig } from "./types.js";

export type AlchemyAccountContextProps =
  | {
      config: AlchemyAccountsConfig;
      queryClient: QueryClient;
      ui?: {
        config: AlchemyAccountsUIConfig;
        openAuthModal: () => void;
        closeAuthModal: () => void;
        isModalOpen: boolean;
      };
    }
  | undefined;

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
 * @param override optional context override that can be used to return a custom context
 * @returns The alchemy account context if one exists
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
 * @param props alchemy accounts provider props
 * @param props.config the acccount config generated using {@link createConfig}
 * @param props.queryClient the react-query query client to use
 * @param props.uiConfig optional UI configuration
 * @param props.children react components that should have this accounts context
 * @returns The element to wrap your application in for Alchemy Accounts context.
 */
export const AlchemyAccountProvider = (
  props: React.PropsWithChildren<AlchemyAccountsProviderProps>
) => {
  const { config, queryClient, children } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsModalOpen(false), []);

  const initialContext = useMemo(
    () => ({
      config,
      queryClient,
      ui: config.ui
        ? {
            config: config.ui,
            openAuthModal,
            closeAuthModal,
            isModalOpen,
          }
        : undefined,
    }),
    [config, queryClient, openAuthModal, closeAuthModal, isModalOpen]
  );

  const { status, isAuthenticating } = useSignerStatus(initialContext);
  const [authStep, setAuthStep] = useState<AuthStep>({
    type: isAuthenticating ? "email_completing" : "initial",
  });

  useEffect(() => {
    if (
      status === "AWAITING_EMAIL_AUTH" &&
      config.ui?.auth?.addPasskeyOnSignup
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get(IS_SIGNUP_QP) !== "true") return;

      openAuthModal();
    }
  }, [status, config.ui, openAuthModal]);

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
            <AuthModal />
          </AuthModalContext.Provider>
        </QueryClientProvider>
      </AlchemyAccountContext.Provider>
    </Hydrate>
  );
};
