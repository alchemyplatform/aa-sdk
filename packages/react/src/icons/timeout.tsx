import { type SVGProps } from "react";
import { useIllustrationStyle } from "../hooks/internal/useIllustrationStyle.js";

export const Timeout = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  const { illustrationStyle } = useIllustrationStyle();

  return (
    <>
      {illustrationStyle === "outline" && (
        <TimedOutIconOutline className={className} {...props} />
      )}
      {illustrationStyle === "filled" && (
        <TimedOutIconFilled className={className} {...props} />
      )}
      {illustrationStyle === "linear" && (
        <TimedOutIconLinear className={className} {...props} />
      )}
      {illustrationStyle === "flat" && (
        <TimedOutIconFlat className={className} {...props} />
      )}
    </>
  );
};
const TimedOutIconOutline = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle
      cx="24.3428"
      cy="27.5426"
      r="18.0571"
      stroke="#DC2626"
      strokeWidth="2.5"
      className="stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
    <path
      d="M24.3999 18.3999L24.3999 28.7999"
      stroke="#DC2626"
      strokeWidth="2.5"
      strokeLinecap="round"
      stroke-linejoin="round"
      className="stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
    <path
      d="M19.3269 3.19995L29.3587 3.19995"
      stroke="#DC2626"
      strokeWidth="2.5"
      strokeLinecap="round"
      stroke-linejoin="round"
      className="stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
  </svg>
);

const TimedOutIconFilled = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="24.3428" cy="27.5427" r="18.0571" fill="#EF4444" />
    <path
      d="M24.3999 18.4L24.3999 28.8"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.3269 3.20001L29.3587 3.20001"
      stroke="#EF4444"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const TimedOutIconLinear = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M25.5 10.5324V29.5H23.5002L14.7756 12.536C17.3152 11.1731 20.2185 10.4 23.3024 10.4C24.0463 10.4 24.7797 10.445 25.5 10.5324Z"
      fill="#FEE2E2"
      className="fill-[#FEE2E2] dark:fill-[rgba(220,38,38,0.2)]"
    />
    <circle
      cx="24.3428"
      cy="27.5427"
      r="18.0571"
      stroke="#DC2626"
      strokeWidth="2.5"
      className="=stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
    <path
      d="M24.3999 18.4L24.3999 28.8"
      stroke="#DC2626"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="=stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
    <path
      d="M19.3269 3.20001L29.3587 3.20001"
      stroke="#DC2626"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="=stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
  </svg>
);

const TimedOutIconFlat = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle
      cx="24.3428"
      cy="27.5426"
      r="18.0571"
      fill="#FECACA"
      className="fill-[#FEE2E2] dark:fill-[rgba(220,38,38,0.2)]"
    />
    <path
      d="M24.3999 18.3999L24.3999 28.7999"
      stroke="#DC2626"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
    <path
      d="M19.3269 3.19995L29.3587 3.19995"
      stroke="#DC2626"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-[#DC2626] dark:stroke-[#EF4444]"
    />
  </svg>
);
