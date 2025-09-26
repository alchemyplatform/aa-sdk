import type { Config } from "wagmi";
import type { MutateOptions, MutationOptions } from "@tanstack/query-core";
import {
  prepareSwap,
  type PrepareSwapParameters,
  type PrepareSwapReturnType,
} from "../actions/prepareSwap.js";

export type PrepareSwapMutate = (
  variables: PrepareSwapParameters,
  options?:
    | MutateOptions<PrepareSwapReturnType, Error, PrepareSwapParameters>
    | undefined,
) => void;

export type PrepareSwapMutateAsync = (
  variables: PrepareSwapParameters,
  options?:
    | MutateOptions<PrepareSwapReturnType, Error, PrepareSwapParameters>
    | undefined,
) => Promise<PrepareSwapReturnType>;

export function prepareSwapMutationOptions(config: Config) {
  return {
    mutationKey: ["prepareSwap"],
    mutationFn: (variables) => {
      return prepareSwap(config, variables);
    },
  } as const satisfies MutationOptions<
    PrepareSwapReturnType,
    Error,
    PrepareSwapParameters
  >;
}
