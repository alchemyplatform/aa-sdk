"use client";

import type { NoUndefined } from "@alchemy/aa-core";
import type { QueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import type { AlchemyAccountsConfig, AlchemyClientState } from "../config";
import { AuthCard, type AuthCardProps } from "./components/auth/card/index.js";
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

export type AlchemyAccountsProviderProps = {
  config: AlchemyAccountsConfig;
  initialState?: AlchemyClientState;
  queryClient: QueryClient;
  uiConfig?: {
    /**
     * If auth config is provided, then the auth modal will be added
     * to the DOM and can be controlled via the `useAuthModal` hook
     */
    auth?: AuthCardProps & { addPasskeyOnSignup?: boolean };
  };
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
  const { config, queryClient, children, uiConfig } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const openAuthModal = () => ref.current?.showModal();
  const closeAuthModal = () => ref.current?.close();

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
    [config, queryClient, uiConfig]
  );

  const { status } = useSignerStatus(initialContext);

  useEffect(() => {
    if (
      status === "AWAITING_EMAIL_AUTH" &&
      uiConfig?.auth?.addPasskeyOnSignup
    ) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get(IS_SIGNUP_QP) !== "true") return;

      openAuthModal();
    }
  }, [status, uiConfig?.auth]);

  return (
    <Hydrate {...props}>
      <AlchemyAccountContext.Provider value={initialContext}>
        {children}
        {uiConfig?.auth && (
          <dialog
            ref={ref}
            className={`modal w-[368px] ${uiConfig.auth.className ?? ""}`}
          >
            <AuthCard
              header={uiConfig.auth.header}
              sections={uiConfig.auth.sections}
              onAuthSuccess={() => closeAuthModal()}
            />
            <div
              className="modal-backdrop"
              onClick={() => closeAuthModal()}
            ></div>
          </dialog>
        )}
      </AlchemyAccountContext.Provider>
    </Hydrate>
  );
};
