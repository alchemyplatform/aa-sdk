"use client";

import { useConfig } from "wagmi";
import { getAuthClient } from "@alchemy/wagmi-core";
import type { AuthClient } from "@alchemy/auth";
import type { ConfigParameter } from "../types";

export type UseAuthClientParameters = ConfigParameter;

export type UseAuthClientReturnType = AuthClient;

/**
 * React hook that returns the AuthClient instance.
 *
 * **Advanced usage only.** For most use cases, use higher-level hooks instead.
 *
 * @param {UseAuthClientParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @returns {AuthClient} The AuthClient instance
 */
export function useAuthClient(
  parameters: UseAuthClientParameters = {},
): UseAuthClientReturnType {
  const config = useConfig(parameters);
  return getAuthClient(config);
}
