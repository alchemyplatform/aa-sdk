import { SVGProps } from "react";

export const InfoIcon = ({
  stroke = "currentColor",
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
      d="M7.99961 7.99961L7.99961 11.1996M7.99961 5.62773V5.59961M1.59961 7.99961C1.59961 4.46499 4.46499 1.59961 7.99961 1.59961C11.5342 1.59961 14.3996 4.46499 14.3996 7.99961C14.3996 11.5342 11.5342 14.3996 7.99961 14.3996C4.46499 14.3996 1.59961 11.5342 1.59961 7.99961Z"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
