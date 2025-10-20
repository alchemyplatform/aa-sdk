import {
  sendSmsOtp,
  type SendSmsOtpParameters,
  type SendSmsOtpReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type SendSmsOtpMutate = (
  variables: SendSmsOtpParameters,
  options?:
    | MutateOptions<SendSmsOtpReturnType, Error, SendSmsOtpParameters>
    | undefined,
) => void;

export type SendSmsOtpMutateAsync = (
  variables: SendSmsOtpParameters,
  options?:
    | MutateOptions<SendSmsOtpReturnType, Error, SendSmsOtpParameters>
    | undefined,
) => Promise<SendSmsOtpReturnType>;

export function sendSmsOtpMutationOptions(config: Config) {
  return {
    mutationKey: ["sendSmsOtp"],
    mutationFn: (variables) => {
      return sendSmsOtp(config, variables);
    },
  } as const satisfies MutationOptions<
    SendSmsOtpReturnType,
    Error,
    SendSmsOtpParameters
  >;
}
