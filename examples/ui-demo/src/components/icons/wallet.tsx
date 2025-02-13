import { SVGProps } from "react";

export const WalletIcon = ({
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
      d="M1.59766 5.02685L1.60078 13.2669C1.60078 14.2094 2.36488 14.9735 3.30745 14.9735H12.6941C13.6367 14.9735 14.4008 14.2094 14.4008 13.2669V6.44019C14.4008 5.65472 13.764 5.01797 12.9786 5.01797H1.6102C1.60456 5.01797 1.59953 5.02153 1.59766 5.02685ZM1.59766 5.02685C1.59818 4.8671 11.2008 1.02686 11.2008 1.02686V4.62685M10.9986 9.84238L10.9874 9.85352"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
