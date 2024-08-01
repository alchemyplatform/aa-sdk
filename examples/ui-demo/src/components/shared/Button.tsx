import { PropsWithChildren } from "react";

export function Button({
  children,
  className,
  ...rest
}: PropsWithChildren<React.ComponentProps<"button"> & { className?: string }>) {
  return (
    <button
      className={`border bg-white rounded-lg px-3 text-sm font-semibold h-10 flex items-center ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
