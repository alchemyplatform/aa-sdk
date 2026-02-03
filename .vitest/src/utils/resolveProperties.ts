import type { MaybePromise } from "viem";

type Deferrable<T> = {
  [K in keyof T]: MaybePromise<T[K]>;
};

function filterUndefined<T>(obj: T): T {
  for (const key in obj) {
    if (obj[key] == null) {
      delete obj[key];
    }
  }
  return obj as T;
}

export async function resolveProperties<T>(object: Deferrable<T>): Promise<T> {
  const promises = Object.keys(object).map((key) => {
    const value = object[key as keyof Deferrable<T>];
    return Promise.resolve(value).then((v) => ({ key: key, value: v }));
  });

  const results = await Promise.all(promises);

  return filterUndefined<T>(
    results.reduce((accum, curr) => {
      accum[curr.key as keyof T] = curr.value;
      return accum;
    }, {} as T),
  );
}
