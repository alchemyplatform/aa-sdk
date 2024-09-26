import { type SVGProps } from "react";

export const Timeout = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 37 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="18.3428" cy="26.543" r="18.0571" fill="#FECACA" />
      <path
        d="M18.3999 17.4004L18.3999 27.8004"
        stroke="#DC2626"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.3269 2.2002L23.3587 2.20019"
        stroke="#DC2626"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
