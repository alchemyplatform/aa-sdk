"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createContext, useContext, useRef } from "react";
import type { AlchemyAccountsConfig, AlchemyClientState } from "../config";
import { AuthCard, type AuthCardProps } from "./components/auth/card/index.js";
import { NoAlchemyAccountContextError } from "./errors.js";
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
    auth?: AuthCardProps;
  };
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

  return (
    <Hydrate {...props}>
      <AlchemyAccountContext.Provider
        value={{
          config,
          queryClient,
          ui: uiConfig
            ? {
                openAuthModal,
                closeAuthModal,
              }
            : undefined,
        }}
      >
        {children}
        {uiConfig?.auth && (
          <dialog
            ref={ref}
            className={`modal w-[368px] ${uiConfig.auth.className ?? ""}`}
          >
            <AuthCard
              header={uiConfig.auth.header}
              sections={uiConfig.auth.sections}
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
