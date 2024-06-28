import { SVGProps } from "react";

export const Code = ({
  stroke = "currentColor",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 14 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6.19961 8.8002L7.79961 1.2002M2.99961 7.6002L0.599609 5.2002L2.99961 2.8002M10.9996 2.8002L13.3996 5.2002L10.9996 7.6002"
      stroke="#020617"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
