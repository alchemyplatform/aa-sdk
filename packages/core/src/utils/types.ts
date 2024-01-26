// borrowed from viem
/**
 * @description Constructs a type by excluding `undefined` from `T`.
 *
 * @example
 * NoUndefined<string | undefined>
 * => string
 */
export type NoUndefined<T> = T extends undefined ? never : T;
// borrowed from viem
/**
 * @description Checks if {@link T} is `undefined`
 * @param T - Type to check
 * @example
 * type Result = IsUndefined<undefined>
 * //   ^? type Result = true
 */

export type IsUndefined<T> = [undefined] extends [T] ? true : false;

export type RequiredBy<TType, TKeys extends keyof TType> = Required<
  Pick<TType, TKeys>
> &
  Omit<TType, TKeys>;
