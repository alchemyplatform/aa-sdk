export const updateHeaderSymbol = Symbol("updateHeader");
export type UpdateHeaderFn = (
  previous: Record<string, string>
) => Record<string, string>;

export type UpdateHeader<T> = {
  [updateHeaderSymbol]<This extends T>(
    this: This,
    update: UpdateHeaderFn
  ): This;
};

export function hasUpdateHeader<A extends {}>(a: A): a is A & UpdateHeader<A> {
  return updateHeaderSymbol in a;
}

export function maybeUpdateHeader<A extends {}>(
  a: A,
  updateHeader: UpdateHeaderFn
): A {
  if (hasUpdateHeader(a)) {
    return a[updateHeaderSymbol](updateHeader);
  }
  return a;
}
