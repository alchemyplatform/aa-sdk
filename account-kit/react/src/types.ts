import type { UseMutationOptions } from "@tanstack/react-query";

/**
 * Base hook mutation arguments.
 *
 * @template TData The mutation data type.
 * @template TVariable The mutation variable type.
 */
export type BaseHookMutationArgs<
  TData extends any = void,
  TVariable extends any = void
> = Partial<
  Omit<
    UseMutationOptions<TData, Error, TVariable, unknown>,
    "mutationFn" | "mutationKey"
  >
>;
