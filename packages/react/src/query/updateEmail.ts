import {
  updateEmail,
  type UpdateEmailParameters,
  type UpdateEmailReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type UpdateEmailMutate = (
  variables: UpdateEmailParameters,
  options?:
    | MutateOptions<UpdateEmailReturnType, Error, UpdateEmailParameters>
    | undefined,
) => void;

export type UpdateEmailMutateAsync = (
  variables: UpdateEmailParameters,
  options?:
    | MutateOptions<UpdateEmailReturnType, Error, UpdateEmailParameters>
    | undefined,
) => Promise<UpdateEmailReturnType>;

export function updateEmailMutationOptions(config: Config) {
  return {
    mutationKey: ["updateEmail"],
    mutationFn: (variables: UpdateEmailParameters) => {
      return updateEmail(config, variables);
    },
  } as const satisfies MutationOptions<
    UpdateEmailReturnType,
    Error,
    UpdateEmailParameters
  >;
}
