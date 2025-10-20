// This entire function is pulled from Wagmi, other than the addition of `bigIntToStringRecursive`.
// We cannot import it directly from Wagmi because it is not exported.
// See source here: https://github.com/wevm/wagmi/blob/9651e18c3d140e37e16dcc80aabc29624344b7c5/packages/core/src/query/utils.ts#L50
export function queryOptionsToKey<type extends Record<string, unknown>>(
  options: type,
): type {
  // destructuring is super fast
  const {
    // import('@tanstack/query-core').QueryOptions
    _defaulted,
    behavior,
    gcTime,
    initialData,
    initialDataUpdatedAt,
    maxPages,
    meta,
    networkMode,
    queryFn,
    queryHash,
    queryKey,
    queryKeyHashFn,
    retry,
    retryDelay,
    structuralSharing,

    // import('@tanstack/query-core').InfiniteQueryObserverOptions
    getPreviousPageParam,
    getNextPageParam,
    initialPageParam,

    // import('@tanstack/react-query').UseQueryOptions
    _optimisticResults,
    enabled,
    notifyOnChangeProps,
    placeholderData,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retryOnMount,
    select,
    staleTime,
    suspense,
    throwOnError,

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // wagmi
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    config,
    connector,
    query,
    ...rest
  } = options;

  return bigIntToStringRecursive(rest) as type;
}

// bigint can not be used as a tanstack query key.
function bigIntToStringRecursive(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(bigIntToStringRecursive);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = bigIntToStringRecursive(val);
    }
    return result;
  }

  return value;
}
