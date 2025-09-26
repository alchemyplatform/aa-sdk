import type { AlchemyConfig } from "@alchemy/wagmi-core";
import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { Compute, ExactPartial, Omit } from "@wagmi/core/internal";

export type ConfigParameter = {
  config?: AlchemyConfig | undefined;
};

// From wagmi.
export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = {
  query?:
    | Omit<
        UseQueryParameters<queryFnData, error, data, queryKey>,
        "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError"
      >
    | undefined;
};

// From wagmi.
export type UseQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = Compute<
  ExactPartial<
    Omit<UseQueryOptions<queryFnData, error, data, queryKey>, "initialData">
  > & {
    // Fix `initialData` type
    initialData?:
      | UseQueryOptions<queryFnData, error, data, queryKey>["initialData"]
      | undefined;
  }
>;
