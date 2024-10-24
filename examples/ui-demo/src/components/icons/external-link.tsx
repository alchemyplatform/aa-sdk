import { SVGProps } from "react";

export const ExternalLinkIcon = ({
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 14 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6.2001 1.09961H3.0001C1.67461 1.09961 0.600098 2.17413 0.600098 3.49961V11.4997C0.600098 12.8252 1.67461 13.8997 3.0001 13.8997H11.0001C12.3256 13.8997 13.4001 12.8252 13.4001 11.4997V8.29961M9.3997 1.0998L13.4001 1.09961M13.4001 1.09961V4.69971M13.4001 1.09961L6.59951 7.89942"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
