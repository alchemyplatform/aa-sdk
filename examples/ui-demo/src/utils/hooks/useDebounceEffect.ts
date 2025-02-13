/**
 * useDebounceEffect.ts
 *
 * @file This is a custom utility hook to debounce the a useEffect.
 * Use-case: When you have an useEffect with dependencies that may fire too often,
 * you can use this hook to debounce the useEffect function so that it only fires after a certain delay.0
 */

import { useEffect, useRef } from "react";

const useDebounceEffect = (fnc: () => void, deps: any[], delay: number) => {
  const ref = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(ref.current);
    ref.current = setTimeout(() => {
      fnc();
      clearTimeout(ref.current);
    }, delay);
  }, [fnc, deps, delay]);
};

export { useDebounceEffect };
