"use client";

import { useMutation, type UseMutateFunction } from "@tanstack/react-query";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { useSigner } from "./useSigner.js";
import { useSignerStatus } from "./useSignerStatus.js";
import type {
  EnableMfaParams,
  EnableMfaResult,
  MfaFactor,
  RemoveMfaParams,
  VerifyMfaParams,
} from "@account-kit/signer";

export type UseMFAResult = {
  addMFA: UseMutateFunction<EnableMfaResult, Error, EnableMfaParams, unknown>;
  verifyMFA: UseMutateFunction<
    { multiFactors: MfaFactor[] },
    Error,
    VerifyMfaParams,
    unknown
  >;
  removeMFA: UseMutateFunction<
    { multiFactors: MfaFactor[] },
    Error,
    RemoveMfaParams,
    unknown
  >;
  getMFAFactors: UseMutateFunction<
    { multiFactors: MfaFactor[] },
    Error,
    void,
    unknown
  >;
  isAddingMFA: boolean;
  isVerifyingMFA: boolean;
  isRemovingMFA: boolean;
  isGettingFactors: boolean;
  isMfaAvailable: boolean;
  error: Error | null;
};

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useMFA.ts) that provides functions and state for managing Multi-Factor Authentication (MFA) operations.
 * Handles adding, verifying, removing, and checking MFA status for an authenticated account.
 *
 * The hook checks if the signer is connected before allowing MFA operations and provides an `isMfaAvailable` flag
 * to indicate whether MFA operations can be performed.
 *
 * @returns {UseMFAResult} An object containing functions and state for handling MFA operations
 *
 * @example
 * ```ts twoslash
 * import { useMFA } from "@account-kit/react";
 *
 * const {
 *   addMFA,
 *   verifyMFA,
 *   removeMFA,
 *   getMFAFactors,
 *   isAddingMFA,
 *   isVerifyingMFA,
 *   isRemovingMFA,
 *   isGettingFactors,
 *   isMfaAvailable,
 *   error
 * } = useMFA();
 * ```
 */
export function useMFA(): UseMFAResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const { isConnected } = useSignerStatus();

  const isMfaAvailable = isConnected && !!signer?.inner;
  const ensureMfaAvailable = () => {
    if (!isMfaAvailable) {
      throw new Error("Signer not connected or initialized");
    }
  };

  const {
    mutate: addMFA,
    isPending: isAddingMFA,
    error: addError,
  } = useMutation<EnableMfaResult, Error, EnableMfaParams>(
    {
      mutationKey: ["addMFA"],
      mutationFn: async (params: EnableMfaParams) => {
        ensureMfaAvailable();
        return signer!.inner.addMfa(params);
      },
    },
    queryClient
  );

  const {
    mutate: verifyMFA,
    isPending: isVerifyingMFA,
    error: verifyError,
  } = useMutation<{ multiFactors: MfaFactor[] }, Error, VerifyMfaParams>(
    {
      mutationFn: async (params) => {
        ensureMfaAvailable();
        return signer!.inner.verifyMfa(params);
      },
    },
    queryClient
  );

  const {
    mutate: removeMFA,
    isPending: isRemovingMFA,
    error: removeError,
  } = useMutation<{ multiFactors: MfaFactor[] }, Error, RemoveMfaParams>(
    {
      mutationFn: async (params) => {
        ensureMfaAvailable();
        return signer!.inner.removeMfa(params);
      },
    },
    queryClient
  );

  const {
    mutate: getMFAFactors,
    isPending: isGettingFactors,
    error: getFactorsError,
  } = useMutation<{ multiFactors: MfaFactor[] }, Error, void>(
    {
      mutationFn: async () => {
        ensureMfaAvailable();
        return signer!.inner.getMfaFactors();
      },
    },
    queryClient
  );

  return {
    addMFA,
    verifyMFA,
    removeMFA,
    getMFAFactors,
    isAddingMFA,
    isVerifyingMFA,
    isRemovingMFA,
    isGettingFactors,
    isMfaAvailable,
    error: addError || verifyError || removeError || getFactorsError,
  };
}
