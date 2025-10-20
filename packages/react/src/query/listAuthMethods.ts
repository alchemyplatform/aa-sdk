import type { Config } from "wagmi";
import type { QueryOptions } from "@tanstack/react-query";
import {
  listAuthMethods,
  type ListAuthMethodsReturnType,
} from "@alchemy/wagmi-core";

const listAuthMethodsQueryKey = ["listAuthMethods"] as const;

export type ListAuthMethodsQueryKey = typeof listAuthMethodsQueryKey;

export function listAuthMethodsQueryOptions(config: Config) {
  return {
    async queryFn() {
      return listAuthMethods(config);
    },
    queryKey: listAuthMethodsQueryKey,
  } as const satisfies QueryOptions<
    ListAuthMethodsReturnType,
    Error,
    ListAuthMethodsReturnType,
    ListAuthMethodsQueryKey
  >;
}
