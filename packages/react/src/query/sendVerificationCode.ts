import {
  sendVerificationCode,
  type SendVerificationCodeParameters,
  type SendVerificationCodeReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type SendVerificationCodeMutate = (
  variables: SendVerificationCodeParameters,
  options?:
    | MutateOptions<
        SendVerificationCodeReturnType,
        Error,
        SendVerificationCodeParameters
      >
    | undefined,
) => void;

export type SendVerificationCodeMutateAsync = (
  variables: SendVerificationCodeParameters,
  options?:
    | MutateOptions<
        SendVerificationCodeReturnType,
        Error,
        SendVerificationCodeParameters
      >
    | undefined,
) => Promise<SendVerificationCodeReturnType>;

export function sendVerificationCodeMutationOptions(config: Config) {
  return {
    mutationKey: ["sendVerificationCode"],
    mutationFn: (variables: SendVerificationCodeParameters) => {
      return sendVerificationCode(config, variables);
    },
  } as const satisfies MutationOptions<
    SendVerificationCodeReturnType,
    Error,
    SendVerificationCodeParameters
  >;
}
