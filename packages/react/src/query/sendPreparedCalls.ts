import type { Config } from "wagmi";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import {
  sendPreparedCalls,
  type SendPreparedCallsParameters,
  type SendPreparedCallsReturnType,
} from "@alchemy/wagmi-core";

export type SendPreparedCallsMutate = (
  variables: SendPreparedCallsParameters,
  options?:
    | MutateOptions<
        SendPreparedCallsReturnType,
        Error,
        SendPreparedCallsParameters
      >
    | undefined,
) => void;

export type SendPreparedCallsMutateAsync = (
  variables: SendPreparedCallsParameters,
  options?:
    | MutateOptions<
        SendPreparedCallsReturnType,
        Error,
        SendPreparedCallsParameters
      >
    | undefined,
) => Promise<SendPreparedCallsReturnType>;

export function sendPreparedCallsMutationOptions(config: Config) {
  return {
    mutationKey: ["sendPreparedCalls"],
    mutationFn: (variables) => {
      return sendPreparedCalls(config, variables);
    },
  } as const satisfies MutationOptions<
    SendPreparedCallsReturnType,
    Error,
    SendPreparedCallsParameters
  >;
}
