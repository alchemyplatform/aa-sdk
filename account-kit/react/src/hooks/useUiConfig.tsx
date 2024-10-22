"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { create, useStore, type StoreApi } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { IS_SIGNUP_QP } from "../components/constants.js";
import type {
  AlchemyAccountsUIConfig,
  AuthIllustrationStyle,
} from "../types.js";
import { useSignerStatus } from "./useSignerStatus.js";

type AlchemyAccountsUIConfigWithDefaults = Omit<
  Required<AlchemyAccountsUIConfig>,
  "auth"
> & {
  auth: NonNullable<Required<AlchemyAccountsUIConfig["auth"]>>;
};

export type UiConfigStore = AlchemyAccountsUIConfig & {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  updateConfig: (config: AlchemyAccountsUIConfig) => void;
};

export const DEFAULT_UI_CONFIG: AlchemyAccountsUIConfigWithDefaults = {
  illustrationStyle: "flat" as AuthIllustrationStyle,
  auth: {
    addPasskeyOnSignup: false,
    header: null,
    hideError: false,
    sections: [[{ type: "email" }], [{ type: "passkey" }]],
    onAuthSuccess: () => {},
    hideSignInText: false,
  },
  modalBaseClassName: "",
  supportUrl: "",
};

export function createUiConfigStore(
  initialConfig: AlchemyAccountsUIConfig = DEFAULT_UI_CONFIG
) {
  return create<UiConfigStore>((set) => ({
    ...initialConfig,
    isModalOpen: false,
    setModalOpen: (isOpen: boolean) => {
      set({ isModalOpen: isOpen });
    },
    updateConfig: (config: AlchemyAccountsUIConfig) => {
      set(() => ({ ...config }));
    },
  }));
}

const UiConfigContext = createContext<StoreApi<UiConfigStore> | undefined>(
  undefined
);

export function useUiConfig<T = UiConfigStore>(
  selector?: (state: UiConfigStore) => T
): T;

/**
 * A custom hook for accessing UI configuration from the `UiConfigContext`. Allows optional selection of specific parts of the UI config state using a selector function.
 *
 * @example
 * ```tsx
 * import { useUiConfig } from "@account-kit/react";
 *
 * const { illustrationStyle, auth } = useUiConfig(({ illustrationStyle, auth }) => ({ illustrationStyle, auth }));
 * ```
 *
 * @param {(state: UiConfigStore) => T} [selector] - An optional function to select specific parts of the UI config state
 * @returns {T} - The selected state passed through the selector function or the entire state if no selector is provided
 * @throws Will throw an error if the `UiConfigContext` is not present in the component tree
 */
export function useUiConfig(
  selector?: (state: UiConfigStore) => UiConfigStore
): UiConfigStore {
  const store = useContext(UiConfigContext);

  if (!store) {
    throw new Error("UiConfigContext must be present in root");
  }

  return useStore(store, useShallow(selector ?? ((state) => state)));
}

export function UiConfigProvider({
  children,
  initialConfig,
}: PropsWithChildren<{ initialConfig?: AlchemyAccountsUIConfig }>) {
  const { isConnected } = useSignerStatus();
  const storeRef = useRef<StoreApi<UiConfigStore>>();
  if (!storeRef.current) {
    storeRef.current = createUiConfigStore(initialConfig);
  }

  const { setModalOpen, addPasskeyOnSignup } = useStore(
    storeRef.current,
    useShallow(({ setModalOpen, auth }) => ({
      setModalOpen,
      addPasskeyOnSignup: auth?.addPasskeyOnSignup,
    }))
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      isConnected &&
      addPasskeyOnSignup &&
      urlParams.get(IS_SIGNUP_QP) === "true"
    ) {
      setModalOpen(true);
    }
  }, [addPasskeyOnSignup, isConnected, setModalOpen]);

  return (
    <UiConfigContext.Provider value={storeRef.current}>
      {children}
    </UiConfigContext.Provider>
  );
}
