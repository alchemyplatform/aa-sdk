import {
  forwardRef,
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type ReactNode,
} from "react";
import { GoogleIcon } from "../icons/google.js";

type ButtonProps = (
  | { type?: "primary" | "secondary" | "link"; icon?: never }
  | { type: "social"; icon?: string | ReactNode }
) &
  Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    "type" | "ref"
  >;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type, children, icon, className, ...props }, ref) => {
    const btnClass = (() => {
      switch (type) {
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
      <button
        className={`btn ${btnClass} ${className ?? ""}`}
        {...props}
        ref={ref}
      >
        {icon && <span>{icon}</span>}
        {children}
      </button>
    );
  }
);

// this is temporary so not gonna document it
// eslint-disable-next-line jsdoc/require-jsdoc
export const DemoSet = (props: ButtonProps) => {
  switch (props.type) {
    case "social": {
      const Icon = () => <GoogleIcon />;
      return (
        <div className="flex flex-col gap-2">
          <Button {...props} icon={<Icon />}>
            {props.children}
          </Button>
          <Button {...props} icon={<Icon />} disabled>
            {props.children}
          </Button>
        </div>
      );
    }
    default:
      return (
        <div className="flex flex-col gap-2">
          <Button {...props}>{props.children}</Button>
          <Button {...props} disabled>
            {props.children}
          </Button>
        </div>
      );
  }
};
