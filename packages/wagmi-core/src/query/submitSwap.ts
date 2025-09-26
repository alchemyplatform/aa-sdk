import type { Config } from "wagmi";
import type { MutateOptions, MutationOptions } from "@tanstack/query-core";
import {
  submitSwap,
  type SubmitSwapParameters,
  type SubmitSwapReturnType,
} from "../actions/submitSwap.js";

export type SubmitSwapMutate = (
  variables: SubmitSwapParameters,
  options?:
    | MutateOptions<SubmitSwapReturnType, Error, SubmitSwapParameters>
    | undefined,
) => void;

export type SubmitSwapMutateAsync = (
  variables: SubmitSwapParameters,
  options?:
    | MutateOptions<SubmitSwapReturnType, Error, SubmitSwapParameters>
    | undefined,
) => Promise<SubmitSwapReturnType>;

export function submitSwapMutationOptions(config: Config) {
  return {
    mutationKey: ["submitSwap"],
    mutationFn: (variables) => {
      return submitSwap(config, variables);
    },
  } as const satisfies MutationOptions<
    SubmitSwapReturnType,
    Error,
    SubmitSwapParameters
  >;
}
