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

/**
 * @description Combines members of an intersection into a readable type.
 *
 * @see {@link https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg}
 * @example
 * Prettify<{ a: string } & { b: string } & { c: number, d: bigint }>
 * => { a: string, b: string, c: number, d: bigint }
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type WithRequired<T, K extends keyof T> = Required<Pick<T, K>>;
export type WithOptional<T, K extends keyof T> = Pick<Partial<T>, K>;
