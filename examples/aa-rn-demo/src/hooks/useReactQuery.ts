import {
  useQuery,
  type QueryFunction,
  type UseQueryOptions,
  type UseQueryResult,
} from "react-query";

const useReactQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(
  queryKey: unknown[],
  queryFn: QueryFunction<TQueryFnData, unknown[]>,
  options?: UseQueryOptions<TQueryFnData, TError, TData, unknown[]>,
): UseQueryResult<TData, TError> => {
  return useQuery(queryKey, queryFn, options);
};

export default useReactQuery;
