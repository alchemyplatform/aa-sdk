import type { JSX, SVGProps } from "react";

// eslint-disable-next-line jsdoc/require-jsdoc
export const HourglassIcon = ({
  stroke = "currentColor",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.651 21.6H17.35c.605 0 1.097-.491 1.097-1.097v-2.931c0-.234-.075-.462-.214-.65l-3.164-4.295a1.097 1.097 0 0 1-.022-1.27l2.934-4.288c.125-.183.191-.399.191-.62V3.497c0-.606-.49-1.097-1.097-1.097H6.651c-.606 0-1.097.491-1.097 1.097v2.93c0 .235.075.463.214.652l3.147 4.27c.285.387.285.915 0 1.302l-3.147 4.27a1.097 1.097 0 0 0-.214.65v2.932c0 .606.491 1.097 1.097 1.097Z"
    />
  </svg>
);
