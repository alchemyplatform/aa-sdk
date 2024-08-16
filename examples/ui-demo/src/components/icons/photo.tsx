import { SVGProps } from "react";

export const PhotoIcon = ({
  color = "#475569",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.5 7.317V4.229c0-.468-.184-.917-.513-1.248a1.743 1.743 0 0 0-1.237-.517H5.25c-.464 0-.91.186-1.237.517-.329.33-.513.78-.513 1.248v3.088m6.999 10.22v-10m0 0-4 3.82m4-3.82 4 3.82"
    />
  </svg>
);
