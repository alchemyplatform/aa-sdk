import { SVGProps } from "react";

export const ClockForwardIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="m12.097 12-3-1V6.819m8 3.181a8 8 0 1 0-1.07 4m-1.124-4.878 2 2 2-2"
    />
  </svg>
);
