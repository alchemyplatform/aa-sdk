import { SVGProps } from "react";

export const DotsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="#E82594"
      d="M6.046 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM12 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM18.089 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
    />
  </svg>
);
