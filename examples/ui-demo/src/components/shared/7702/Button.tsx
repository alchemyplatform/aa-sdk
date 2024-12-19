import { PropsWithChildren } from "react";

export const Button = ({
  children,
  className,
  ...rest
}: PropsWithChildren<
  React.ComponentProps<"button"> & { className?: string }
>) => {
  return (
    <button
      className={`border bg-bg-surface-default text-fg-primary rounded-lg px-3 text-sm font-semibold h-10 flex items-center justify-center text-center ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
