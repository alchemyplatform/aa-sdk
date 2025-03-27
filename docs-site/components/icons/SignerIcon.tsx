import { SVGProps } from "react";

export const SignerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke="#E82594"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m10.447 18.035.619-.693c.758-.85 2.12-.74 2.732.222a1.719 1.719 0 0 0 2.598.356l1.121-1.006M4 13l3.5 3m-4-3 9.86-10.204a2.718 2.718 0 1 1 3.844 3.845L7 16.5 2 18l1.5-5Z"
    />
  </svg>
);
