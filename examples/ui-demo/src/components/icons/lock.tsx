import { SVGProps } from "react";

export const LockIcon = ({
  stroke = "currentColor",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={18}
    fill="none"
    {...props}
  >
    <path
      stroke="#020617"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M2.5 6.547V5.55C2.5 3.03 4.507 1 7 1s4.5 2.03 4.5 4.551v1.493M7 12.071v-2m6 .956C13 14.326 10.314 17 7 17s-6-2.674-6-5.973c0-3.3 2.686-5.974 6-5.974s6 2.675 6 5.974Z"
    />
  </svg>
);
