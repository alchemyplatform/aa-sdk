"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
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
  addMFA: UseMutationResult<EnableMfaResult, Error, EnableMfaParams>;
  verifyMFA: UseMutationResult<
    { multiFactors: MfaFactor[] },
    Error,
    VerifyMfaParams
  >;
  removeMFA: UseMutationResult<
    { multiFactors: MfaFactor[] },
    Error,
    RemoveMfaParams
  >;
  getMFAFactors: UseMutationResult<{ multiFactors: MfaFactor[] }, Error, void>;
  isReady: boolean;
};

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useMFA.ts) that provides functions and state for managing multi-factor authentication (MFA) operations.
 * Handles adding, verifying, removing, and getting MFA factors for an authenticated account.
 *
 * The hook checks if the signer is connected before allowing MFA operations and provides an `isReady` flag
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
 *   isReady
 * } = useMFA();
 * ```
 */
export function useMFA(): UseMFAResult {
  const { queryClient } = useAlchemyAccountContext();
  const signer = useSigner();
  const { isConnected } = useSignerStatus();

  const isReady = isConnected && !!signer;
  const ensureMfaAvailable = () => {
    if (!isReady) {
      throw new Error("Signer not connected or initialized");
    }
  };

  const addMFA = useMutation<EnableMfaResult, Error, EnableMfaParams>(
    {
      mutationKey: ["addMFA"],
      mutationFn: async (params) => {
        ensureMfaAvailable();
        return signer!.addMfa(params);
      },
    },
    queryClient
  );

  const verifyMFA = useMutation<
    { multiFactors: MfaFactor[] },
    Error,
    VerifyMfaParams
  >(
    {
      mutationKey: ["verifyMFA"],
      mutationFn: async (params) => {
        ensureMfaAvailable();
        return signer!.verifyMfa(params);
      },
    },
    queryClient
  );

  const removeMFA = useMutation<
    { multiFactors: MfaFactor[] },
    Error,
    RemoveMfaParams
  >(
    {
      mutationKey: ["removeMFA"],
      mutationFn: async (params) => {
        ensureMfaAvailable();
        return signer!.removeMfa(params);
      },
    },
    queryClient
  );

  const getMFAFactors = useMutation<{ multiFactors: MfaFactor[] }, Error, void>(
    {
      mutationKey: ["getMFAFactors"],
      mutationFn: async () => {
        ensureMfaAvailable();
        return signer!.getMfaFactors();
      },
    },
    queryClient
  );

  return {
    addMFA,
    verifyMFA,
    removeMFA,
    getMFAFactors,
    isReady,
  };
}
