import {
  loginWithOauth,
  type LoginWithOauthParameters,
  type LoginWithOauthReturnType,
} from "@alchemy/wagmi-core";
import type { MutateOptions, MutationOptions } from "@tanstack/react-query";
import type { Config } from "wagmi";

export type LoginWithOauthMutate = (
  variables: LoginWithOauthParameters,
  options?:
    | MutateOptions<LoginWithOauthReturnType, Error, LoginWithOauthParameters>
    | undefined,
) => void;

export type LoginWithOauthMutateAsync = (
  variables: LoginWithOauthParameters,
  options?:
    | MutateOptions<LoginWithOauthReturnType, Error, LoginWithOauthParameters>
    | undefined,
) => Promise<LoginWithOauthReturnType>;

export function loginWithOauthMutationOptions(config: Config) {
  return {
    mutationKey: ["loginWithOauth"],
    mutationFn: (variables) => {
      return loginWithOauth(config, variables);
    },
  } as const satisfies MutationOptions<
    LoginWithOauthReturnType,
    Error,
    LoginWithOauthParameters
  >;
}
