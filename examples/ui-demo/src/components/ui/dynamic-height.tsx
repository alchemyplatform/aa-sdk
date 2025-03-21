import { useResizeObserver } from "@/hooks/useResizeObserver";
import { PropsWithChildren, useLayoutEffect, useRef, useState } from "react";

export function DynamicHeight({ children }: PropsWithChildren) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.getBoundingClientRect().height);
    }
  }, [contentRef]);

  useResizeObserver({
    ref: contentRef,
    box: "border-box",
    onResize: (size) => {
      setHeight(size.height);
    },
  });
  return (
    <div
      className="transition-[height] duration-200 ease-out"
      style={{
        height: height ? `${height}px` : undefined,
      }}
    >
      <div className="z-[1]" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
