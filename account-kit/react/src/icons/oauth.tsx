import type { SVGProps } from "react";
import { Spinner } from "./spinner.js";
import type { KnownAuthProvider } from "../../../signer/dist/types/signer.js";

interface ContinueWithOAuthProps {
  provider: KnownAuthProvider;
}

interface OAuthConnectionFailedWithProps {
  provider: KnownAuthProvider;
}

// TO DO: extend for BYO auth provider
export function ContinueWithOAuth({ provider }: ContinueWithOAuthProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-12 w-12">
      <Spinner className="absolute top-0 left-0 right-0 bottom-0" />
      {(provider === "google" && <GoogleIcon />) ||
        (provider === "facebook" && <FacebookIcon />)}
    </div>
  );
}

// TO DO: extend for BYO auth provider
export function OAuthConnectionFailed({
  provider,
}: OAuthConnectionFailedWithProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-12 w-12">
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="24" r="22" stroke="#FECACA" strokeWidth="2.5" />
          <rect x="32" y="32" width="18" height="18" rx="9" fill="#DC2626" />
          <path
            d="M43 39L39 43M43 43L39 39"
            stroke="white"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {(provider === "google" && <GoogleIcon />) ||
        (provider === "facebook" && <FacebookIcon />)}
    </div>
  );
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const GoogleIcon = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="20"
      viewBox="0 0 19 20"
      fill="none"
      {...props}
    >
      <g id="google-logo-color">
        <path
          id="Vector"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.801 10.2092C18.8016 9.58043 18.7459 8.95291 18.6347 8.33411H10V11.8798H14.9335C14.8317 12.4407 14.6171 12.9752 14.3026 13.4508C13.9882 13.9264 13.5805 14.3333 13.1043 14.6467V16.9472H16.067C17.8004 15.3507 18.8005 13.0009 18.8005 10.2092H18.801Z"
          fill="#3E82F1"
        />
        <path
          id="Vector_2"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.99991 19.1667C12.4749 19.1667 14.5503 18.3458 16.0669 16.9461L13.1042 14.6457C12.2833 15.1957 11.2333 15.5211 9.99991 15.5211C7.61246 15.5211 5.59116 13.9087 4.8707 11.7417H1.80811V14.1199C2.57171 15.6376 3.7421 16.9133 5.18863 17.8045C6.63515 18.6957 8.3009 19.1673 9.99991 19.1667Z"
          fill="#32A753"
        />
        <path
          id="Vector_3"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.87126 11.7422C4.48742 10.6128 4.48742 9.38827 4.87126 8.25888V5.88379H1.80815C1.16712 7.16152 0.833313 8.57129 0.833313 10.0008C0.833313 11.4303 1.16712 12.8401 1.80815 14.1178L4.87126 11.7422Z"
          fill="#F9BB00"
        />
        <path
          id="Vector_4"
          d="M1.80811 5.88379L4.87121 8.25889C5.59219 6.09185 7.61297 4.47944 10.0004 4.47944C11.3466 4.47944 12.5547 4.94292 13.5049 5.85032L16.1344 3.22083C14.5467 1.7418 12.4718 0.833375 9.99991 0.833375C8.30045 0.832779 6.6343 1.3048 5.18767 2.19667C3.74104 3.08855 2.57093 4.36515 1.80811 5.88379Z"
          fill="#E74133"
        />
      </g>
    </svg>
  );
};

export const FacebookIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
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
          <stop stopColor="#0062E0" />
          <stop offset="1" stopColor="#19AFFF" />
        </linearGradient>
        <clipPath id="clip0_2387_27657">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const AppleIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g id="apple">
        <path
          id="Vector"
          d="M22.192 18.7033C21.8291 19.5418 21.3995 20.3136 20.9017 21.0232C20.2232 21.9906 19.6677 22.6602 19.2395 23.032C18.5758 23.6424 17.8647 23.955 17.1033 23.9728C16.5566 23.9728 15.8974 23.8172 15.13 23.5017C14.3601 23.1876 13.6526 23.032 13.0056 23.032C12.3271 23.032 11.5995 23.1876 10.8211 23.5017C10.0416 23.8172 9.41359 23.9816 8.93346 23.9979C8.20326 24.0291 7.47543 23.7076 6.74893 23.032C6.28524 22.6276 5.70526 21.9343 5.01046 20.9521C4.265 19.9032 3.65213 18.687 3.172 17.3004C2.65779 15.8026 2.40002 14.3523 2.40002 12.9482C2.40002 11.3398 2.74757 9.95259 3.4437 8.7901C3.99079 7.85635 4.71862 7.11978 5.62956 6.57906C6.54049 6.03834 7.52476 5.76279 8.58473 5.74516C9.16471 5.74516 9.92528 5.92456 10.8704 6.27714C11.8129 6.63091 12.4181 6.81031 12.6834 6.81031C12.8818 6.81031 13.5541 6.60054 14.6937 6.18233C15.7715 5.79449 16.6811 5.6339 17.4262 5.69716C19.4454 5.86012 20.9624 6.6561 21.9713 8.09013C20.1654 9.18431 19.2721 10.7169 19.2899 12.6829C19.3062 14.2142 19.8617 15.4886 20.9535 16.5004C21.4483 16.97 22.0009 17.333 22.6157 17.5907C22.4824 17.9774 22.3416 18.3477 22.192 18.7033ZM17.561 0.480134C17.561 1.68041 17.1225 2.8011 16.2485 3.8384C15.1937 5.07155 13.9179 5.78412 12.5344 5.67168C12.5168 5.52768 12.5065 5.37613 12.5065 5.21688C12.5065 4.06462 13.0081 2.83147 13.8989 1.8232C14.3437 1.3127 14.9093 0.888225 15.5952 0.549613C16.2796 0.216053 16.927 0.0315842 17.5359 1.07373e-08C17.5536 0.160454 17.561 0.320924 17.561 0.480119V0.480134Z"
          fill="black"
        />
      </g>
    </svg>
  );
};
