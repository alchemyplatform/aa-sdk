import type { Config } from "wagmi";
import type { QueryOptions } from "@tanstack/react-query";
import { queryOptionsToKey } from "./utils.js";
import {
  prepareCalls,
  type PrepareCallsParameters,
  type PrepareCallsReturnType,
} from "@alchemy/wagmi-core";

export type PrepareCallsOptions = PrepareCallsParameters;

function prepareCallsQueryKey(options: PrepareCallsOptions) {
  const { connector: _connector, ...rest } = options;
  return ["prepareCalls", queryOptionsToKey(rest)] as const;
}

export type PrepareCallsQueryKey = ReturnType<typeof prepareCallsQueryKey>;

export function prepareCallsQueryOptions(
  config: Config,
  options: PrepareCallsOptions,
) {
  return {
    async queryFn({ queryKey }) {
      const { connector } = options;
      const params = queryKey[1];

      return prepareCalls(config, {
        connector,
        ...(params as PrepareCallsParameters),
      });
    },
    queryKey: prepareCallsQueryKey(options),
  } as const satisfies QueryOptions<
    PrepareCallsReturnType,
    Error,
    PrepareCallsReturnType,
    PrepareCallsQueryKey
  >;
}
