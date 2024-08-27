import { useAuthContext } from "../components/auth/context.js";

export type UseAuthErrorResult = Error | undefined;

/**
 * Returns the error returned from the current auth step, if it exists
 *
 * @example
 * ```tsx
 * import { useAuthError } from "@account-kit/react";
 *
 * const error = useAuthError();
 *
 * if (error) {
 *  console.error("Error occurred during auth step", error);
 * }
 * ```
 *
 * @returns {UseAuthErrorResult} the current Error object
 */
export function useAuthError(): UseAuthErrorResult {
  const { authStep } = useAuthContext();
  if ("error" in authStep) {
    return authStep.error;
  }

  return undefined;
}
