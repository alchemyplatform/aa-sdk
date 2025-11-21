export type Never<T> = T extends object
  ? {
      [K in keyof T]?: never;
    }
  : never;

export type NonEmptyArray<T> = [T, ...T[]];

export type ExtractRpcMethod<
  T extends readonly {
    Method: string;
    Parameters?: unknown;
    ReturnType: unknown;
  }[],
  M extends T[number]["Method"],
> = Extract<T[number], { Method: M }>;
