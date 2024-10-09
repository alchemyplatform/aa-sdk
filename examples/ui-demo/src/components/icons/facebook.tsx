import { SVGProps } from "react";

export const FacebookLogo = ({
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clip-path="url(#clip0_2387_27657)">
      <path
        d="M10.02 23.88C4.32 22.86 0 17.94 0 12C0 5.4 5.4 0 12 0C18.6 0 24 5.4 24 12C24 17.94 19.68 22.86 13.98 23.88L13.32 23.34H10.68L10.02 23.88Z"
        fill="url(#paint0_linear_2387_27657)"
      />
      <path
        d="M16.68 15.3602L17.22 12.0002H14.04V9.66018C14.04 8.70018 14.4 7.98018 15.84 7.98018H17.4V4.92018C16.56 4.80018 15.6 4.68018 14.76 4.68018C12 4.68018 10.08 6.36018 10.08 9.36018V12.0002H7.07996V15.3602H10.08V23.8202C10.74 23.9402 11.4 24.0002 12.06 24.0002C12.72 24.0002 13.38 23.9402 14.04 23.8202V15.3602H16.68Z"
        fill="white"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_2387_27657"
        x1="12.0006"
        y1="23.1654"
        x2="12.0006"
        y2="-0.00442066"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#0062E0" />
        <stop offset="1" stop-color="#19AFFF" />
      </linearGradient>
      <clipPath id="clip0_2387_27657">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
