import type { UseMutationOptions } from "@tanstack/react-query";

export type BaseHookMutationArgs<
  TData extends any = void,
  TVariable extends any = void
> = Partial<
  Omit<
    UseMutationOptions<TData, Error, TVariable, unknown>,
    "mutationFn" | "mutationKey"
  >
>;
