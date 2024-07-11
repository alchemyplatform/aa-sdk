"use client";

import { useAlchemyAccountContext } from "../context.js";
import { MissingUiConfigError } from "../errors.js";

export const useUiConfig = () => {
  const { ui } = useAlchemyAccountContext();
  if (ui == null) {
    throw new MissingUiConfigError("useUiConfig");
  }

  return {
    ...ui.config,
  };
};
