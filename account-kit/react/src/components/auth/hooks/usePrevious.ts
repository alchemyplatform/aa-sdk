import { useEffect, useRef } from "react";

export const usePrevious = <T>(thing: T) => {
  const previous = useRef<T>();

  useEffect(() => {
    previous.current = thing;
  }, [thing]);

  return previous.current;
};
