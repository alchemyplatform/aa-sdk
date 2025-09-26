// From wagmi: https://github.com/wevm/wagmi/blob/9651e18c3d140e37e16dcc80aabc29624344b7c5/packages/core/src/query/utils.ts#L50
export function filterQueryOptions<type extends Record<string, unknown>>(
  options: type,
): type {
  // destructuring is super fast
  // biome-ignore format: no formatting
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

  return rest as type;
}
