"use client";

import { useAlchemyAccountContext } from "../context.js";
import { MissingUiConfigError } from "../errors.js";
import type { AlchemyAccountsUIConfig } from "../types.js";

export const useUiConfig = () => {
  const { ui } = useAlchemyAccountContext();
  if (ui == null) {
    throw new MissingUiConfigError("useUiConfig");
  }

  // We set some defaults here
  return {
    ...ui.config,
    illustrationStyle: ui.config.illustrationStyle ?? "flat",
    auth: {
      ...ui.config.auth,
      addPasskeyOnSignup: ui.config.auth?.addPasskeyOnSignup ?? false,
      header: ui.config.auth?.header ?? null,
      hideError: ui.config.auth?.hideError ?? false,
      sections: ui.config.auth?.sections ?? [
        [{ type: "email" }],
        [{ type: "passkey" }],
      ],
      showSignInText: ui.config.auth?.showSignInText ?? true,
    },
  } satisfies AlchemyAccountsUIConfig;
};
