import {
  updatePhoneNumber,
  type UpdatePhoneNumberParameters,
  type UpdatePhoneNumberReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type UpdatePhoneNumberMutate = (
  variables: UpdatePhoneNumberParameters,
  options?:
    | MutateOptions<
        UpdatePhoneNumberReturnType,
        Error,
        UpdatePhoneNumberParameters
      >
    | undefined,
) => void;

export type UpdatePhoneNumberMutateAsync = (
  variables: UpdatePhoneNumberParameters,
  options?:
    | MutateOptions<
        UpdatePhoneNumberReturnType,
        Error,
        UpdatePhoneNumberParameters
      >
    | undefined,
) => Promise<UpdatePhoneNumberReturnType>;

export function updatePhoneNumberMutationOptions(config: Config) {
  return {
    mutationKey: ["updatePhoneNumber"],
    mutationFn: (variables: UpdatePhoneNumberParameters) => {
      return updatePhoneNumber(config, variables);
    },
  } as const satisfies MutationOptions<
    UpdatePhoneNumberReturnType,
    Error,
    UpdatePhoneNumberParameters
  >;
}
