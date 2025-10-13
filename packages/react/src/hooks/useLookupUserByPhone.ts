"use client";

import type { MutateOptions } from "@tanstack/query-core";
import { useMutation } from "@tanstack/react-query";
import type { UseMutationParameters, UseMutationReturnType } from "wagmi/query";
import { useConfig } from "wagmi";
import {
  lookupUserByPhone,
  type LookupUserByPhoneParameters,
  type LookupUserByPhoneReturnType,
} from "@alchemy/wagmi-core";
import type { ConfigParameter } from "../types";

type LookupUserByPhoneMutate = (
  variables: LookupUserByPhoneParameters,
  options?:
    | MutateOptions<
        LookupUserByPhoneReturnType,
        Error,
        LookupUserByPhoneParameters
      >
    | undefined,
) => void;

type LookupUserByPhoneMutateAsync = (
  variables: LookupUserByPhoneParameters,
  options?:
    | MutateOptions<
        LookupUserByPhoneReturnType,
        Error,
        LookupUserByPhoneParameters
      >
    | undefined,
) => Promise<LookupUserByPhoneReturnType>;

export type UseLookupUserByPhoneParameters = ConfigParameter & {
  mutation?:
    | UseMutationParameters<
        LookupUserByPhoneReturnType,
        Error,
        LookupUserByPhoneParameters
      >
    | undefined;
};

export type UseLookupUserByPhoneReturnType = UseMutationReturnType<
  LookupUserByPhoneReturnType,
  Error,
  LookupUserByPhoneParameters
> & {
  lookupUserByPhone: LookupUserByPhoneMutate;
  lookupUserByPhoneAsync: LookupUserByPhoneMutateAsync;
};

/**
 * React hook for looking up if a phone number is registered in the system.
 *
 * This hook wraps the `lookupUserByPhone` action with React Query mutation functionality,
 * providing loading states, error handling, and mutation management.
 *
 * @param {UseLookupUserByPhoneParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseMutationParameters} [parameters.mutation] - Optional React Query mutation configuration
 * @returns {UseLookupUserByPhoneReturnType} TanStack Query mutation object with the following properties:
 * - `lookupUserByPhone`: `(variables: LookupUserByPhoneParameters, options?) => void` - Mutation function to lookup user by phone
 * - `lookupUserByPhoneAsync`: `(variables: LookupUserByPhoneParameters, options?) => Promise<LookupUserByPhoneReturnType>` - Async mutation function that returns a promise
 * - `data`: `LookupUserByPhoneReturnType | undefined` - The lookup result (orgId or null)
 * - `error`: `Error | null` - The error object for the mutation, if an error was encountered
 * - `isError`: `boolean` - True if the mutation is in an error state
 * - `isIdle`: `boolean` - True if the mutation is in its initial idle state
 * - `isPending`: `boolean` - True if the mutation is currently executing
 * - `isSuccess`: `boolean` - True if the last mutation attempt was successful
 * - `failureCount`: `number` - The failure count for the mutation
 * - `failureReason`: `Error | null` - The failure reason for the mutation retry
 * - `isPaused`: `boolean` - True if the mutation has been paused
 * - `reset`: `() => void` - Function to reset the mutation to its initial state
 * - `status`: `'idle' | 'pending' | 'error' | 'success'` - Current status of the mutation
 * - `submittedAt`: `number` - Timestamp for when the mutation was submitted
 * - `variables`: `LookupUserByPhoneParameters | undefined` - The variables object passed to the mutation
 *
 * @example
 * ```tsx twoslash
 * import { useLookupUserByPhone } from '@alchemy/react';
 *
 * function PhoneChecker() {
 *   const { lookupUserByPhone, data, isPending } = useLookupUserByPhone();
 *
 *   const handleLookup = () => {
 *     lookupUserByPhone({ phoneNumber: '+12025551234' });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleLookup} disabled={isPending}>
 *         Check Phone
 *       </button>
 *       {data && <p>User exists: {data.orgId}</p>}
 *       {data === null && <p>Phone not registered</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLookupUserByPhone(
  parameters: UseLookupUserByPhoneParameters = {},
): UseLookupUserByPhoneReturnType {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    mutationKey: ["lookupUserByPhone"],
    mutationFn: (variables) => {
      return lookupUserByPhone(config, variables);
    },
  });

  return {
    ...result,
    lookupUserByPhone: mutate,
    lookupUserByPhoneAsync: mutateAsync,
  };
}
