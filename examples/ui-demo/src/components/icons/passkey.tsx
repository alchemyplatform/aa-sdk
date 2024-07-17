import { JSX, SVGProps } from "react";

export const PasskeyIcon = ({
  stroke,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    className="stroke-fg-primary disabled:stroke-fg-disabled"
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.843 5.016a6.474 6.474 0 0 0-.98 3.424c0 .24.049 1.782.049 1.782A6.47 6.47 0 0 1 3 13.532M13.938 8.44c-.004-1.571-1.042-3.424-3.196-3.424S7.327 6.784 7.323 8.351V9.3c0 2.256-.26 4.416-1.656 6.221m2.48 2.812a13.919 13.919 0 0 0 2.614-8.103V8.318m1.517 9.134c.618-.681 1.66-3.806 1.66-5.89m2.794 4.066c.565-1.841.84-5.41.84-7.329 0-3.653-3.045-6.621-6.811-6.632h-.02a7.018 7.018 0 0 0-3.418.889"
    />
  </svg>
);
