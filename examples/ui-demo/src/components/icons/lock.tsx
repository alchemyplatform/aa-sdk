import { SVGProps } from "react";

export const LockIcon = ({
  stroke = "currentColor",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      d="M5.5 7.54667V6.55117C5.5 4.02997 7.50714 2 10 2C12.4929 2 14.5 4.02997 14.5 6.55117V8.04446M10 13.0713V11.0713M16 12.0267C16 15.3258 13.3137 18.0001 10 18.0001C6.68629 18.0001 4 15.3258 4 12.0267C4 8.7277 6.68629 6.05332 10 6.05332C13.3137 6.05332 16 8.7277 16 12.0267Z"
      stroke="#020617"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
