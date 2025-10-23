import {
  addPasskey,
  type AddPasskeyParameters,
  type AddPasskeyReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type AddPasskeyMutate = (
  variables: AddPasskeyParameters,
  options?:
    | MutateOptions<AddPasskeyReturnType, Error, AddPasskeyParameters>
    | undefined,
) => void;

export type AddPasskeyMutateAsync = (
  variables: AddPasskeyParameters,
  options?:
    | MutateOptions<AddPasskeyReturnType, Error, AddPasskeyParameters>
    | undefined,
) => Promise<AddPasskeyReturnType>;

export function addPasskeyMutationOptions(config: Config) {
  return {
    mutationKey: ["addPasskey"],
    mutationFn: (variables: AddPasskeyParameters) => {
      return addPasskey(config, variables);
    },
  } as const satisfies MutationOptions<
    AddPasskeyReturnType,
    Error,
    AddPasskeyParameters
  >;
}
