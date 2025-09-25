import type { SVGProps } from "react";

export const Building2 = ({
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
    <path
      d="M2 14H14M3 14V3C3 2.44772 3.44772 2 4 2H12C12.5523 2 13 2.44772 13 3V14M7 5H9M7 8H9M7 11H9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
