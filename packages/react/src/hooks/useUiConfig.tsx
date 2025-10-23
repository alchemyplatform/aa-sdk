"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  AlchemyAccountsUIConfig,
  AuthIllustrationStyle,
} from "../types.js";

type AlchemyAccountsUIConfigWithDefaults = Omit<
  Required<AlchemyAccountsUIConfig>,
  "auth"
> & {
  auth: NonNullable<Required<AlchemyAccountsUIConfig["auth"]>>;
};

export type UiConfigStore = AlchemyAccountsUIConfig & {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
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
  uiMode: "modal",
};

const UiConfigContext = createContext<UiConfigStore | undefined>(undefined);

// TODO: use the selector param to prevent unnecessary re-renders
export function useUiConfig<T = UiConfigStore>(
  selector?: (state: UiConfigStore) => T,
): T;

export function useUiConfig(): UiConfigStore {
  const store = useContext(UiConfigContext);

  if (!store) {
    throw new Error("useUiConfig must be called within a UiConfigProvider");
  }

  return store;
}

export function UiConfigProvider({
  children,
  initialConfig,
}: PropsWithChildren<{ initialConfig?: AlchemyAccountsUIConfig }>) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const value = useMemo(
    () => ({
      ...initialConfig,
      isModalOpen,
      setModalOpen: setIsModalOpen,
    }),
    [initialConfig, isModalOpen],
  );

  return (
    <UiConfigContext.Provider value={value}>
      {children}
    </UiConfigContext.Provider>
  );
}
