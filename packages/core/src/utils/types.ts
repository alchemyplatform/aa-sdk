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

// Checks for type equivalence, evaluates always to either `true` or `false`.
// Semantics: (EQ<A, B> = true) <==> (A <==> B)
export type EQ<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

// Auxiliary type for `IsMemberOrSubtypeOfAComponent`
// Evaluates to `true` or `boolean` if one of the explicit components (according to the TypeScript distribution
// mechanism for union types) of the union type equals the other given type.
// Examples:
//    EqualsOneOfTheComponents<string, string | boolean> ⟶ boolean
//    EqualsOneOfTheComponents<string, string> ⟶ true
//    EqualsOneOfTheComponents<number, string | boolean> ⟶ false
export type EqualsOneOfTheComponents<T, Union> = Union extends infer Component // enforce distribution
  ? EQ<T, Component>
  : never;

// Auxiliary type for `IsOneOf`
export type IsMemberOrSubtypeOfAComponent<
  T,
  Union,
  ConjunctionOfExplicitComponentChecks extends boolean
> = [T] extends [Union]
  ? true extends ConjunctionOfExplicitComponentChecks
    ? true
    : false
  : false;

// Checks whether the given type equals one of the explicit components of the union type. Note that in this respect we
// consider the members of the infinite types number and string as implicit since the inbuilt distribution mechanism of
// TypeScript does not (cannot) distribute over the infinite number of strings or numbers. However, `boolean` is treated
// by TypeScript (and accordingly here) as the explicit union `true | false`.
//
// In particular, the evaluation result is `false` if the type is a proper union of components of the union type. It also
// evaluates to false if the given type is a proper subtype of one of its explicit components.
// It always evaluates to either `true` or `false`.
// Examples:
//    IsOneOf<number, string | number | boolean> ⟶ true
//    IsOneOf<2 | 4, 0 | 1 | 2 | 3 | 4 | 5 | 6> ⟶ false
//    IsOneOf<'text', string> ⟶ false  // only implicit but not explicit component
export type IsOneOf<T, Union> = IsMemberOrSubtypeOfAComponent<
  T,
  Union,
  EqualsOneOfTheComponents<T, Union>
>;

export type OneOf<T1, T2> = IsOneOf<T1, T2> extends true ? T1 : never;

export type RecordableKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];
