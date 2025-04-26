import { PropsWithChildren } from "react";

export const Button = ({
  children,
  className,
  ...rest
}: PropsWithChildren<
  React.ComponentProps<"button"> & { className?: string }
>) => {
  return (
    <button className={`akui-btn-auth akui-btn ${className}`} {...rest}>
      {children}
    </button>
  );
};
