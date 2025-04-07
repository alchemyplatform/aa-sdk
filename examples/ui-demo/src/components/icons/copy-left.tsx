import { JSX, SVGProps } from "react";

export const CopyLeftIcon = ({
  stroke = "#475569",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="copy-left">
      <path
        id="Icon"
        d="M5 12L3 12C2.44771 12 2 11.5523 2 11L2 4C2 2.89543 2.89543 2 4 2L11 2C11.5523 2 12 2.44772 12 3L12 5M10 18L16 18C17.1046 18 18 17.1046 18 16L18 10C18 8.89543 17.1046 8 16 8L10 8C8.89543 8 8 8.89543 8 10L8 16C8 17.1046 8.89543 18 10 18Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);
