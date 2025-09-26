import type { MutateOptions, MutationOptions } from "@tanstack/query-core";
import {
  submitOtpCode,
  type SubmitOtpCodeParameters,
  type SubmitOtpCodeReturnType,
} from "../actions/submitOtpCode.js";
import type { Config } from "wagmi";

export type SubmitOtpCodeMutate = (
  variables: SubmitOtpCodeParameters,
  options?:
    | MutateOptions<SubmitOtpCodeReturnType, Error, SubmitOtpCodeParameters>
    | undefined,
) => void;

export type SubmitOtpCodeMutateAsync = (
  variables: SubmitOtpCodeParameters,
  options?:
    | MutateOptions<SubmitOtpCodeReturnType, Error, SubmitOtpCodeParameters>
    | undefined,
) => Promise<SubmitOtpCodeReturnType>;

export function submitOtpCodeMutationOptions(config: Config) {
  return {
    mutationKey: ["submitOtpCode"],
    mutationFn: (variables) => {
      return submitOtpCode(config, variables);
    },
  } as const satisfies MutationOptions<
    SubmitOtpCodeReturnType,
    Error,
    SubmitOtpCodeParameters
  >;
}
