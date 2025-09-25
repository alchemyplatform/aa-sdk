import type { SVGProps } from "react";

export const CreditCard = ({
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
      d="M14 3.5H2C1.44772 3.5 1 3.94772 1 4.5V11.5C1 12.0523 1.44772 12.5 2 12.5H14C14.5523 12.5 15 12.0523 15 11.5V4.5C15 3.94772 14.5523 3.5 14 3.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 7H15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
