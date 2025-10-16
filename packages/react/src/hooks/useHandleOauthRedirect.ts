"use client";

import { useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { handleOauthRedirect } from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";

export type UseHandleOauthRedirectParameters = ConfigParameter & {
  /** Whether to enable automatic OAuth redirect handling. Defaults to true. */
  enabled?: boolean;
};

export type UseHandleOauthRedirectReturnType = {
  /** Whether the OAuth redirect is currently being processed */
  isPending: boolean;
  /** Error that occurred during OAuth redirect handling, if any */
  error: Error | null;
  /** Whether the OAuth redirect was successfully handled */
  isSuccess: boolean;
};

/**
 * React hook that automatically handles OAuth redirect callbacks on component mount.
 *
 * This hook should be used when implementing OAuth authentication with `mode: "redirect"`.
 * It checks for OAuth parameters in the URL (`alchemy-bundle` or `alchemy-org-id`) and
 * automatically completes the authentication flow.
 *
 * Note: This hook is NOT needed when using `mode: "popup"` (the default).
 *
 * @param {UseHandleOauthRedirectParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {boolean} [parameters.enabled] - Whether to enable automatic redirect handling (defaults to true)
 * @returns {UseHandleOauthRedirectReturnType} Object containing:
 * - `isPending`: `boolean` - True while processing the OAuth redirect
 * - `error`: `Error | null` - Error object if redirect handling failed
 * - `isSuccess`: `boolean` - True if redirect was successfully handled
 *
 * @example
 * ```tsx twoslash
 * import { useHandleOauthRedirect } from '@alchemy/react';
 *
 * function App() {
 *   const { isPending, error, isSuccess } = useHandleOauthRedirect();
 *
 *   if (isPending) {
 *     return <div>Completing authentication...</div>;
 *   }
 *
 *   if (error) {
 *     return <div>Authentication failed: {error.message}</div>;
 *   }
 *
 *   return <div>Your app content</div>;
 * }
 * ```
 */
export function useHandleOauthRedirect(
  parameters: UseHandleOauthRedirectParameters = {},
): UseHandleOauthRedirectReturnType {
  const { enabled = true } = parameters;
  const config = useConfig(parameters);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if we're handling an OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const hasOauthParams =
      urlParams.has("alchemy-bundle") || urlParams.has("alchemy-org-id");

    if (!hasOauthParams) return;

    setIsPending(true);

    handleOauthRedirect(config)
      .then(() => {
        setIsSuccess(true);
        setError(null);
        // Clean up URL parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      })
      .catch((err: Error) => {
        setError(err);
        setIsSuccess(false);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, [config, enabled]);

  return {
    isPending,
    error,
    isSuccess,
  };
}
