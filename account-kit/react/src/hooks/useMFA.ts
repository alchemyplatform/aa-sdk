"use client";

import {
  useMutation,
  type UseMutateFunction,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useAlchemyAccountContext } from "../context.js";
import type { BaseHookMutationArgs } from "../types.js";
import { useSigner } from "./useSigner.js";
import { useSignerStatus } from "./useSignerStatus.js";
import type { EnableMfaResult, MfaFactor } from "@account-kit/signer";

export type UseMFAResult = {
  addMFA: UseMutateFunction<
    EnableMfaResult,
    Error,
    { multiFactorType: "totp" },
    unknown
  >;
  verifyMFA: UseMutateFunction<
    { multiFactors: MfaFactor[] },
    Error,
    { multiFactorId: string; multiFactorCode: string },
    unknown
  >;
  removeMFA: UseMutateFunction<
    { multiFactors: MfaFactor[] },
    Error,
    { multiFactorIds: string[] },
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
 * @param {BaseHookMutationArgs} [mutationArgs] Optional mutation arguments to configure the MFA operations
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
 * } = useMFA({
 *   onSuccess: () => {
 *     // do something on success
 *   },
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export function useMFA(mutationArgs?: BaseHookMutationArgs): UseMFAResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const { isConnected } = useSignerStatus();

  // MFA is available only when signer is connected and initialized
  const isMfaAvailable = isConnected && !!signer?.inner;

  const {
    mutate: addMFA,
    isPending: isAddingMFA,
    error: addError,
  } = useMutation<EnableMfaResult, Error, { multiFactorType: "totp" }>(
    {
      mutationFn: async (params) => {
        if (!isMfaAvailable) {
          throw new Error("Signer not connected or initialized");
        }
        return signer!.inner.addMfa(params);
      },
      ...(mutationArgs as UseMutationOptions<
        EnableMfaResult,
        Error,
        { multiFactorType: "totp" },
        unknown
      >),
    },
    queryClient
  );

  const {
    mutate: verifyMFA,
    isPending: isVerifyingMFA,
    error: verifyError,
  } = useMutation<
    { multiFactors: MfaFactor[] },
    Error,
    { multiFactorId: string; multiFactorCode: string }
  >(
    {
      mutationFn: async (params) => {
        if (!isMfaAvailable) {
          throw new Error("Signer not connected or initialized");
        }
        return signer!.inner.verifyMfa(params);
      },
      ...(mutationArgs as UseMutationOptions<
        { multiFactors: MfaFactor[] },
        Error,
        { multiFactorId: string; multiFactorCode: string },
        unknown
      >),
    },
    queryClient
  );

  const {
    mutate: removeMFA,
    isPending: isRemovingMFA,
    error: removeError,
  } = useMutation<
    { multiFactors: MfaFactor[] },
    Error,
    { multiFactorIds: string[] }
  >(
    {
      mutationFn: async (params) => {
        if (!isMfaAvailable) {
          throw new Error("Signer not connected or initialized");
        }
        return signer!.inner.removeMfa(params);
      },
      ...(mutationArgs as UseMutationOptions<
        { multiFactors: MfaFactor[] },
        Error,
        { multiFactorIds: string[] },
        unknown
      >),
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
        if (!isMfaAvailable) {
          throw new Error("Signer not connected or initialized");
        }
        return signer!.inner.getMfaFactors();
      },
      ...(mutationArgs as UseMutationOptions<
        { multiFactors: MfaFactor[] },
        Error,
        void,
        unknown
      >),
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
