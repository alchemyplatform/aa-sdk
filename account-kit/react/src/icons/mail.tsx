import type { SVGProps } from "react";

// eslint-disable-next-line jsdoc/require-jsdoc
export const MailIcon = ({
  fill = "currentColor",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    className="fill-fg-primary disabled:fill-fg-disabled"
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={16}
    fill="none"
    {...props}
  >
    <path
      fill={fill}
      fillRule="evenodd"
      d="M1.335 2.705 9 8.07l7.665-5.365a1.048 1.048 0 0 0-.998-.747H2.333c-.469 0-.87.317-.998.747ZM16.708 4.2l-7.35 5.145a.625.625 0 0 1-.716 0L1.292 4.2V13c0 .572.47 1.042 1.041 1.042h13.334c.571 0 1.041-.47 1.041-1.042V4.2ZM.042 3A2.297 2.297 0 0 1 2.333.708h13.334A2.297 2.297 0 0 1 17.958 3v10a2.297 2.297 0 0 1-2.291 2.292H2.333A2.297 2.297 0 0 1 .042 13V3Z"
      clipRule="evenodd"
    />
  </svg>
);
