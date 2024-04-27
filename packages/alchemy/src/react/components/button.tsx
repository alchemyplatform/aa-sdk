import {
  forwardRef,
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type ReactNode,
} from "react";
import { GoogleIcon } from "../logos/google.js";

type ButtonProps = (
  | {
      type?: "primary";
      icon?: never;
    }
  | { type: "secondary"; icon?: never }
  | { type: "social"; icon?: string | ReactNode }
) &
  Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    "type" | "ref"
  >;

export const InternalButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type, children, icon, ...props }, ref) => {
    switch (type) {
      case "secondary":
        return (
          <button className="btn btn-secondary" {...props} ref={ref}>
            {children}
          </button>
        );
      case "social":
        return (
          <button className="btn btn-auth" {...props} ref={ref}>
            {icon && <span>{icon}</span>}
            {children}
          </button>
        );
      case "primary":
      default:
        return (
          <button className="btn btn-primary" {...props} ref={ref}>
            {children}
          </button>
        );
    }
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
          <InternalButton {...props} icon={<Icon />}>
            {props.children}
          </InternalButton>
          <InternalButton {...props} icon={<Icon />} disabled>
            {props.children}
          </InternalButton>
        </div>
      );
    }
    default:
      return (
        <div className="flex flex-col gap-2">
          <InternalButton {...props}>{props.children}</InternalButton>
          <InternalButton {...props} disabled>
            {props.children}
          </InternalButton>
        </div>
      );
  }
};
