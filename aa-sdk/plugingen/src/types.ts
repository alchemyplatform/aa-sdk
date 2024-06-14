// Source: https://github.com/wevm/wagmi/blob/main/packages/cli/src/types.ts
export type Evaluate<type> = { [key in keyof type]: type[key] } & unknown;

export type MaybeArray<T> = T | T[];

export type MaybePromise<T> = T | Promise<T>;

export type RequiredBy<TType, TKeys extends keyof TType> = Required<
  Pick<TType, TKeys>
> &
  Omit<TType, TKeys>;
