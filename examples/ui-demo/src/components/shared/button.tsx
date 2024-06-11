import { PropsWithChildren } from "react";

export function Button({ children }: PropsWithChildren<object>) {
  return (
    <button className="border bg-white border-fg-secondary rounded-lg px-4 py-3 text-sm font-semibold">
      {children}
    </button>
  );
}
