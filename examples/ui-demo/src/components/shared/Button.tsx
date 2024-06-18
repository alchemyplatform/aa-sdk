import { PropsWithChildren } from "react";

export function Button({
  children,
  className,
}: PropsWithChildren<{ className: string }>) {
  return (
    <button
      className={`border bg-white rounded-lg px-3 text-sm font-semibold h-10 flex items-center ${className}`}
    >
      {children}
    </button>
  );
}
