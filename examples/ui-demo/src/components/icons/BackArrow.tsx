import type { SVGProps } from "react";

// eslint-disable-next-line jsdoc/require-jsdoc
export const BackArrow = ({
  fill = "currentColor",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M7.22238 12L3.3335 8M3.3335 8L7.22238 4M3.3335 8H12.6668"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
