import type { UseMutationOptions } from "@tanstack/react-query";

export type BaseHookMutationArgs<
  TData extends any = void,
  TVariable extends any = void
> = {
  onSuccess?:
    | ((data: TData, variables: TVariable, context: unknown) => unknown)
    | undefined;
  onError?:
    | ((error: Error, variables: TVariable, context: unknown) => unknown)
    | undefined;
  onSettled?:
    | ((
        data: TData | undefined,
        error: Error | null,
        variables: TVariable,
        context: unknown
      ) => unknown)
    | undefined;
} & Partial<
  Omit<
    UseMutationOptions<TData, Error, TVariable, unknown>,
    "mutationFn" | "mutationKey"
  >
>;
