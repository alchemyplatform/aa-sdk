import { useAuthContext } from "../components/auth/context.js";

export type UseErrorResult = Error | undefined;

/**
 * Returns the error returned from the current auth step, if it exists
 *
 * @returns the current Error object
 */
export function useError(): UseErrorResult {
  const { authStep } = useAuthContext();
  // TODO: generalize this, since only passkey_verify and eoa_connect have errors right now
  return (
    ((authStep.type === "passkey_verify" || authStep.type === "eoa_connect") &&
      authStep.error) ||
    undefined
  );
}
