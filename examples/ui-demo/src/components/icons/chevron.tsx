import { SVGProps } from "react";

export const ChevronRight = ({
  fill = "#475569",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    className="fill-fg-primary disabled:fill-fg-disabled"
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="#000"
      fillRule="evenodd"
      d="M7.058 4.558a.625.625 0 0 1 .884 0l5 5a.625.625 0 0 1 0 .884l-5 5a.625.625 0 1 1-.884-.884L11.616 10 7.058 5.442a.625.625 0 0 1 0-.884Z"
      clipRule="evenodd"
    />
  </svg>
);
