import { type SVGProps } from "react";

export const ConnectionFailed = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 47 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="23.6" cy="23.5998" r="22.8" fill="#FECACA" />
      <path
        d="M23.76 29.3717V30.1431M23.76 17.0288L23.7662 24.7431"
        stroke="#DC2626"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
