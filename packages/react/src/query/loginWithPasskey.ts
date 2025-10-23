import {
  loginWithPasskey,
  type LoginWithPasskeyParameters,
  type LoginWithPasskeyReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type LoginWithPasskeyMutate = (
  variables: LoginWithPasskeyParameters,
  options?:
    | MutateOptions<
        LoginWithPasskeyReturnType,
        Error,
        LoginWithPasskeyParameters
      >
    | undefined,
) => void;

export type LoginWithPasskeyMutateAsync = (
  variables: LoginWithPasskeyParameters,
  options?:
    | MutateOptions<
        LoginWithPasskeyReturnType,
        Error,
        LoginWithPasskeyParameters
      >
    | undefined,
) => Promise<LoginWithPasskeyReturnType>;

export function loginWithPasskeyMutationOptions(config: Config) {
  return {
    mutationKey: ["loginWithPasskey"],
    mutationFn: (variables: LoginWithPasskeyParameters) => {
      return loginWithPasskey(config, variables);
    },
  } as const satisfies MutationOptions<
    LoginWithPasskeyReturnType,
    Error,
    LoginWithPasskeyParameters
  >;
}
