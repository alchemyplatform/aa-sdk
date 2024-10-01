import { SVGProps } from "react";

export const LogoutIcon = ({
  stroke = "#363FF9",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.85354 1.40039H2.38296C2.00853 1.40039 1.64944 1.54789 1.38469 1.81044C1.11993 2.07299 0.971191 2.42909 0.971191 2.80039V11.2004C0.971191 11.5717 1.11993 11.9278 1.38469 12.1903C1.64944 12.4529 2.00853 12.6004 2.38296 12.6004H4.85354M5.029 7.00039H13.029M13.029 7.00039L9.97224 3.80039M13.029 7.00039L9.97224 10.2004"
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
