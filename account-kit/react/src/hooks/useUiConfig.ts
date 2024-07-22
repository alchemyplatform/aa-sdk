"use client";

import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { useAlchemyAccountContext } from "../context.js";
import { MissingUiConfigError } from "../errors.js";
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

type UiConfigStore = AlchemyAccountsUIConfig & {
  updateConfig: (partial: AlchemyAccountsUIConfig) => void;
};

export const DEFAULT_UI_CONFIG: AlchemyAccountsUIConfigWithDefaults = {
  illustrationStyle: "flat" as AuthIllustrationStyle,
  auth: {
    addPasskeyOnSignup: false,
    header: null,
    hideError: false,
    sections: [[{ type: "email" }], [{ type: "passkey" }]],
    hideSignInText: false,
    onAuthSuccess: () => {},
  },
  modalBaseClassName: "",
};

const internal_useUiConfig = create<UiConfigStore>((set) => ({
  ...DEFAULT_UI_CONFIG,
  updateConfig: (config: AlchemyAccountsUIConfig) => set(() => config),
}));

/**
 * Custom hook to manage and update the UI configuration. This hook retrieves the UI config from the context, syncs it with the local state, and updates it if necessary.
 * NOTE: this hook is mainly meant to be used internally, but provides utility if you need your UI config to be dynamic
 *
 * @example
 * ```ts
 * import { createConfig, useUiConfig, DEFAULT_UI_CONFIG } from "@account-kit/react";
 * import { sepolia } from "@account-kit/infra";
 *
 * const config = createConfig({
 *  apiKey: "you-api-key",
 *  chain: sepolia
 * }, DEFAULT_UI_CONFIG);
 *
 * // somewhere in a component...
 *
 * const { updateConfig, ...uiConfig } = useUiConfig();
 * ```
 *
 * @returns {AlchemyAccountsUIConfigWithDefaults & {updateConfig: (partial: AlchemyAccountsUIConfig) => void}} the configuration object along with an update function
 */
export const useUiConfig = () => {
  const { updateConfig, ...config } = internal_useUiConfig();
  // The UI config might actually be null when passed to the provider.
  // This is expected because someone might opt out of using UI components
  // so we don't want to render the modal.
  const { ui } = useAlchemyAccountContext();

  useEffect(() => {
    if (!ui) return;

    updateConfig(ui.config);
  }, [ui, updateConfig]);

  if (!ui) {
    throw new MissingUiConfigError("useUiConfig");
  }

  const uiConfig = useMemo(
    () =>
      ({
        ...config,
        updateConfig,
      } as AlchemyAccountsUIConfigWithDefaults & {
        updateConfig: (partial: AlchemyAccountsUIConfig) => void;
      }),
    [config, updateConfig]
  );

  return uiConfig;
};
