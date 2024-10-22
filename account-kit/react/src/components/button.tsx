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
  >;

export const Button = ({
  variant,
  children,
  icon,
  className,
  ...props
}: ButtonProps) => {
  const btnClass = (() => {
    switch (variant) {
      case "secondary":
        return "btn-secondary";
      case "social":
        return "btn-auth";
      case "link":
        return "btn-link";
      case "primary":
      default:
        return "btn-primary";
    }
  })();

  return (
    <button className={`btn ${btnClass} ${className ?? ""}`} {...props}>
      {icon && <span>{icon}</span>}
      <div className="btn-content">{children}</div>
    </button>
  );
};
