import {
  sendEmailOtp,
  type SendEmailOtpParameters,
  type SendEmailOtpReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type SendEmailOtpMutate = (
  variables: SendEmailOtpParameters,
  options?:
    | MutateOptions<SendEmailOtpReturnType, Error, SendEmailOtpParameters>
    | undefined,
) => void;

export type SendEmailOtpMutateAsync = (
  variables: SendEmailOtpParameters,
  options?:
    | MutateOptions<SendEmailOtpReturnType, Error, SendEmailOtpParameters>
    | undefined,
) => Promise<SendEmailOtpReturnType>;

export function sendEmailOtpMutationOptions(config: Config) {
  return {
    mutationKey: ["sendEmailOtp"],
    mutationFn: (variables) => {
      return sendEmailOtp(config, variables);
    },
  } as const satisfies MutationOptions<
    SendEmailOtpReturnType,
    Error,
    SendEmailOtpParameters
  >;
}
