import type { SVGProps } from "react";

export const Info = ({
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 11V8M8 5H8.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
