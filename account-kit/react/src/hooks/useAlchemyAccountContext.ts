import { AlchemyAccountContext } from "../AlchemyAccountContext.js";
import { NoAlchemyAccountContextError } from "../errors.js";
import { useContext } from "react";
import type { AlchemyAccountContextProps } from "../AlchemyAccountContext.js";

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
  override?: AlchemyAccountContextProps,
): AlchemyAccountContextProps => {
  const context = useContext(AlchemyAccountContext);
  if (override != null) return override;

  if (context == null) {
    throw new NoAlchemyAccountContextError("useAlchemyAccountContext");
  }

  return context;
};
