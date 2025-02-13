import type { SVGProps } from "react";

export const GoogleIcon = ({
  className,
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={19}
      height={20}
      fill="none"
      {...props}
    >
      <path
        fill="#3E82F1"
        fillRule="evenodd"
        d="M18.801 10.21c0-.63-.055-1.257-.166-1.876H10v3.546h4.934a4.212 4.212 0 0 1-1.83 2.767v2.3h2.963C17.8 15.351 18.8 13.001 18.8 10.21h.001Z"
        clipRule="evenodd"
      />
      <path
        fill="#32A753"
        fillRule="evenodd"
        d="M10 19.167c2.475 0 4.55-.821 6.067-2.22l-2.963-2.301c-.82.55-1.87.875-3.104.875-2.388 0-4.409-1.612-5.13-3.78H1.809v2.379A9.167 9.167 0 0 0 10 19.167Z"
        clipRule="evenodd"
      />
      <path
        fill="#F9BB00"
        fillRule="evenodd"
        d="M4.871 11.742a5.412 5.412 0 0 1 0-3.483V5.884H1.808a9.181 9.181 0 0 0 0 8.234l3.063-2.376Z"
        clipRule="evenodd"
      />
      <path
        fill="#E74133"
        d="m1.808 5.884 3.063 2.375c.721-2.167 2.742-3.78 5.13-3.78 1.346 0 2.554.464 3.504 1.371l2.63-2.63C14.546 1.743 12.471.834 10 .834a9.164 9.164 0 0 0-8.192 5.05Z"
      />
    </svg>
  );
};
