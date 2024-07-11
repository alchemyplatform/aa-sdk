"use client";

import { type MutableRefObject, useLayoutEffect, useState } from "react";
import { useResizeObserver } from "./useResizeObserver.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export function useElementHeight(
  target: MutableRefObject<HTMLDivElement | null>
) {
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    if (target.current) {
      setHeight(target.current.getBoundingClientRect().height);
    }
  }, [target]);

  useResizeObserver({
    ref: target,
    box: "border-box",
    onResize: (size) => {
      setHeight(size.height);
    },
  });

  return { height };
}
