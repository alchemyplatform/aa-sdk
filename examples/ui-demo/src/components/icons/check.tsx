import { SVGProps } from "react";

export const CheckIcon = ({
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path
          d="M17 9.50049L11 15.5005L8.00003 12.5005M12.5 2.40039C7.19809 2.40039 2.90002 6.69846 2.90002 12.0004C2.90002 17.3023 7.19809 21.6004 12.5 21.6004C17.802 21.6004 22.1 17.3023 22.1 12.0004C22.1 6.69846 17.802 2.40039 12.5 2.40039Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
