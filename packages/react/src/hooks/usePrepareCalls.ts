"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useConfig } from "wagmi";
import type { ConfigParameter, QueryParameter } from "../types";
import type { PrepareCallsReturnType } from "@alchemy/wagmi-core";
import {
  prepareCallsQueryOptions,
  type PrepareCallsOptions,
  type PrepareCallsQueryKey,
} from "../query/prepareCalls.js";

export type UsePrepareCallsParameters = PrepareCallsOptions &
  ConfigParameter &
  QueryParameter<
    PrepareCallsReturnType,
    Error,
    PrepareCallsReturnType,
    PrepareCallsQueryKey
  >;

export type UsePrepareCallsReturnType = UseQueryResult<
  PrepareCallsReturnType,
  Error
>;

/**
 * React hook for preparing calls for execution.
 *
 * This hook wraps the `prepareCalls` action with React Query functionality,
 * providing loading states, error handling, and caching for preparing calls.
 *
 * @param {UsePrepareCallsParameters} parameters - Configuration options for the hook
 * @param {Config} [parameters.config] - Optional wagmi config override
 * @param {UseQueryParameters} [parameters.query] - Optional React Query configuration
 * @returns {UsePrepareCallsReturnType} TanStack Query object with the following properties:
 * - `data`: `PrepareCallsReturnType | undefined` - The query data, or undefined if still loading
 * - `dataUpdatedAt`: `number` - The timestamp for when the query most recently returned data
 * - `error`: `Error | null` - The error object for the query, if an error was encountered
 * - `errorUpdateCount`: `number` - The sum of all errors
 * - `errorUpdatedAt`: `number` - The timestamp for when the query most recently returned an error
 * - `failureCount`: `number` - The failure count for the query
 * - `failureReason`: `Error | null` - The failure reason for the query retry
 * - `fetchStatus`: `'fetching' | 'paused' | 'idle'` - Current fetch status of the query
 * - `isError`: `boolean` - True if the query attempt resulted in an error
 * - `isFetched`: `boolean` - True if the query has been fetched
 * - `isFetchedAfterMount`: `boolean` - True if the query has been fetched after the component mounted
 * - `isFetching`: `boolean` - True if the query is currently fetching
 * - `isInitialLoading`: `boolean` - True if the query is in its initial loading state
 * - `isLoading`: `boolean` - True if the query is in a loading state
 * - `isLoadingError`: `boolean` - True if the query failed while fetching for the first time
 * - `isPending`: `boolean` - True if the query is currently pending (fetching or fresh data is not available)
 * - `isPlaceholderData`: `boolean` - True if the data shown is placeholder data
 * - `isRefetchError`: `boolean` - True if the query failed while refetching
 * - `isRefetching`: `boolean` - True if the query is currently refetching
 * - `isStale`: `boolean` - True if the data in the cache is invalidated or if the data is older than the given staleTime
 * - `isSuccess`: `boolean` - True if the query was successful and data is available
 * - `refetch`: `(options?) => Promise<UseQueryResult>` - Function to manually refetch the query
 * - `status`: `'pending' | 'error' | 'success'` - Current status of the query
 *
 * @example
 * ```tsx twoslash
 * import { usePrepareCalls } from '@alchemy/react';
 *
 * function CallsForm() {
 *   const { data, isLoading, error } = usePrepareCalls({
 *     calls: [
 *       { to: '0x...', data: '0x...' }
 *     ]
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data && <div>Calls prepared successfully</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePrepareCalls(
  parameters: UsePrepareCallsParameters,
): UsePrepareCallsReturnType {
  const { connector, query } = parameters;

  const config = useConfig(parameters);

  const options = prepareCallsQueryOptions(config, {
    ...parameters,
    connector,
  });

  return useQuery({ ...query, ...options });
}
