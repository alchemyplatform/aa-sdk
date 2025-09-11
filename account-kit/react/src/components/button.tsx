import {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type ReactNode,
} from "react";

type ButtonProps = (
  | { variant?: "primary" | "secondary" | "link"; icon?: never }
  | { variant: "social"; icon?: string | ReactNode }
) &
  Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    "variant" | "ref"
  > & {
    fullWidthContent?: boolean;
  };

export const Button = ({
  variant,
  children,
  icon,
  className,
  fullWidthContent,
  ...props
}: ButtonProps) => {
  const btnClass = (() => {
    switch (variant) {
      case "secondary":
        return "akui-btn-secondary";
      case "social":
        return "akui-btn-auth";
      case "link":
        return "akui-btn-link";
      case "primary":
      default:
        return "akui-btn-primary";
    }
  })();

  return (
    <button className={`akui-btn ${btnClass} ${className ?? ""}`} {...props}>
      {icon && <span>{icon}</span>}
      <div className={`akui-btn-content ${fullWidthContent ? "w-full" : ""}`}>
        {children}
      </div>
    </button>
  );
};
