import type { Config } from "wagmi";
import type { QueryOptions } from "@tanstack/react-query";
import { queryOptionsToKey } from "./utils.js";
import {
  prepareSwap,
  type PrepareSwapParameters,
  type PrepareSwapReturnType,
} from "@alchemy/wagmi-core";

export type PrepareSwapOptions = PrepareSwapParameters;

function prepareSwapQueryKey(options: PrepareSwapOptions) {
  const { connector: _connector, ...rest } = options;
  return ["prepareSwap", queryOptionsToKey(rest)] as const;
}

export type PrepareSwapQueryKey = ReturnType<typeof prepareSwapQueryKey>;

export function prepareSwapQueryOptions(
  config: Config,
  options: PrepareSwapOptions,
) {
  return {
    async queryFn({ queryKey }) {
      const { connector } = options;
      const params = queryKey[1];

      return prepareSwap(config, { connector, ...params });
    },
    queryKey: prepareSwapQueryKey(options),
  } as const satisfies QueryOptions<
    PrepareSwapReturnType,
    Error,
    PrepareSwapReturnType,
    PrepareSwapQueryKey
  >;
}
