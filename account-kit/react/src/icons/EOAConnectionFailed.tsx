import { type SVGProps } from "react";
import { useIllustrationStyle } from "../hooks/internal/useIllustrationStyle.js";

const Ring = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  const { illustrationStyle } = useIllustrationStyle();

  const isRingGrey =
    illustrationStyle === "filled" || illustrationStyle === "flat";

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="26"
        cy="26.0002"
        r="24"
        className={
          isRingGrey
            ? "stroke-[#F87171] dark:stroke-[#CBDFE1]"
            : "stroke-[#F87171] dark:stroke-[#B91C1C]"
        }
        stroke="#F87171"
        strokeWidth="2.5"
      />
    </svg>
  );
};

const Cross = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect y="0.000183105" width="16" height="16" rx="8" fill="#DC2626" />
    <path
      d="M10 6.00012L6 10.0001M10 10.0001L6 6.00012"
      stroke="white"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

export const EOAConnectionFailed = {
  Ring,
  Cross,
};
