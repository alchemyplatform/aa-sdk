import {
  forwardRef,
  useLayoutEffect,
  useState,
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, children, icon, className, ...props }, ref) => {
    const [localRef, setLocalRef] = useState<HTMLButtonElement | null>(null);

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

    const [hideChildren, setHideChildren] = useState(false);

    useLayoutEffect(() => {
      if (!localRef) return;

      const parent = localRef.parentElement;
      if (!parent) return;
      const siblings = parent.children;

      // this assumes this element is in a button group
      // in a 3 element button group all buttons have their text shown
      if (siblings.length <= 3) return;

      const index = Array.from(siblings).indexOf(localRef);

      if (index >= 1) {
        setHideChildren(true);
      }
    }, [localRef]);

    return (
      <button
        className={`btn ${btnClass} ${className ?? ""}`}
        {...props}
        ref={(elem) => {
          if (typeof ref === "function") {
            ref(elem);
          } else if (ref != null) {
            ref.current = elem;
          }

          setLocalRef(elem);
        }}
      >
        {icon && <span>{icon}</span>}
        {!hideChildren && children}
      </button>
    );
  }
);
