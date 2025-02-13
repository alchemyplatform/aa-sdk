import { type SVGProps } from "react";
import { useIllustrationStyle } from "../hooks/internal/useIllustrationStyle.js";

export const ConnectionFailed = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  const { illustrationStyle } = useIllustrationStyle();

  return (
    <>
      {illustrationStyle === "outline" && (
        <ConnectionFailedOutline className={className} {...props} />
      )}
      {illustrationStyle === "filled" && (
        <ConnectionFailedFilled className={className} {...props} />
      )}
      {illustrationStyle === "linear" && (
        <ConnectionFailedLinear className={className} {...props} />
      )}
      {illustrationStyle === "flat" && (
        <ConnectionFailedFlat className={className} {...props} />
      )}
    </>
  );
};

const ConnectionFailedOutline = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="39"
    height="39"
    viewBox="0 0 39 39"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle
      cx="19.6572"
      cy="19.6571"
      r="18.0571"
      stroke="#DC2626"
      strokeWidth="2.5"
      className="stroke-[#DC2626] dark:[#EF4444]"
    />
    <path
      d="M19.76 25.3718V26.1432M19.76 13.0289L19.7662 20.7432"
      stroke="#DC2626"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ConnectionFailedFilled = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="37"
    height="37"
    viewBox="0 0 37 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="18.6572" cy="18.6571" r="18.0571" fill="#EF4444" />
    <path
      d="M18.76 24.3718V25.1432M18.76 12.0289L18.7662 19.7432"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);
const ConnectionFailedLinear = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="39"
    height="39"
    viewBox="0 0 39 39"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 15.857C1.738 17.0812 1.6001 18.3515 1.6001 19.654C1.6001 20.9565 1.738 22.2267 2 23.451V15.857ZM20 37.7079C29.8145 37.5252 37.7144 29.5122 37.7144 19.654C37.7144 9.79581 29.8145 1.78275 20 1.60004V37.7079Z"
      fill="#FEE2E2"
      className="fill-[#FEE2E2] dark:fill-[rgba(220,38,38,0.2)]"
    />
    <circle
      cx="19.6572"
      cy="19.6571"
      r="18.0571"
      stroke="#DC2626"
      strokeWidth="2.5"
    />
    <path
      d="M19.76 25.3717V26.1432M19.76 13.0289L19.7662 20.7432"
      stroke="#DC2626"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ConnectionFailedFlat = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="37"
    height="37"
    viewBox="0 0 37 37"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle
      cx="18.6572"
      cy="18.6571"
      r="18.0571"
      fill="#FECACA"
      className="fill-[#FECACA] dark:fill-[rgba(239,68,68,0.2)]"
    />
    <path
      d="M18.76 24.3718V25.1432M18.76 12.0289L18.7662 19.7432"
      stroke="#DC2626"
      strokeWidth="3"
      strokeLinecap="round"
      className="stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
  </svg>
);
