import Link, { LinkProps } from "next/link";
import { forwardRef, ReactNode } from "react";

const ExternalLink = forwardRef<
  HTMLAnchorElement,
  LinkProps & { className?: string; children: ReactNode }
>(({ className, children, ...rest }, ref) => {
  return (
    <Link
      {...rest}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
    >
      {children}
    </Link>
  );
});
ExternalLink.displayName = "ExternalLink";

export default ExternalLink;
