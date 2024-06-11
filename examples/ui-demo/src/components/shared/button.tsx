import { PropsWithChildren } from "react";

export function Button({ children }: PropsWithChildren<object>) {
  return (
    <button className="border bg-white border-fg-secondary rounded-lg px-3 text-sm font-semibold h-10 flex items-center">
      {children}
    </button>
  );
}
