import { useState } from "react";

export const usePromise = <T>() => {
  const [resolve, setResolve] = useState<(value: T) => void>();
  const [reject, setReject] = useState<(reason?: any) => void>();

  const [promise] = useState(
    () =>
      new Promise<T>((resolve, reject) => {
        setResolve(() => resolve);
        setReject(() => reject);
      })
  );

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
};
