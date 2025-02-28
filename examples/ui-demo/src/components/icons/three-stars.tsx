import { SVGProps } from "react";

export const ThreeStarsIcon = ({
  width = 80,
  height = 80,
  isBranded = false,
  ...props
}: JSX.IntrinsicAttributes &
  SVGProps<SVGSVGElement> & { isBranded?: boolean }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M37.208 49.899L37.6135 43.6214L32.3579 47.1414L30.1843 43.3132L35.8455 40.5557L30.1843 37.7981L32.3579 33.9699L37.6135 37.4899L37.208 31.2124H41.5715L41.1497 37.4899L46.4053 33.9699L48.579 37.7981L42.934 40.5557L48.579 43.3132L46.4053 47.1414L41.1497 43.6214L41.5715 49.899H37.208Z"
      fill={isBranded ? "" : "#363FF9"}
      className={isBranded ? "fill-fg-accent-brand" : ""}
    />
    <g opacity="0.3">
      <path
        d="M11.4246 49.899L11.8301 43.6214L6.57449 47.1414L4.40088 43.3132L10.062 40.5557L4.40088 37.7981L6.57449 33.9699L11.8301 37.4899L11.4246 31.2124H15.788L15.3663 37.4899L20.6219 33.9699L22.7955 37.7981L17.1506 40.5557L22.7955 43.3132L20.6219 47.1414L15.3663 43.6214L15.788 49.899H11.4246Z"
        fill={isBranded ? "" : "#363FF9"}
        className={isBranded ? "fill-fg-accent-brand" : ""}
      />
      <path
        d="M62.9912 49.899L63.3967 43.6214L58.1411 47.1414L55.9675 43.3132L61.6286 40.5557L55.9675 37.7981L58.1411 33.9699L63.3967 37.4899L62.9912 31.2124H67.3546L66.9329 37.4899L72.1885 33.9699L74.3621 37.7981L68.7172 40.5557L74.3621 43.3132L72.1885 47.1414L66.9329 43.6214L67.3546 49.899H62.9912Z"
        fill={isBranded ? "" : "#363FF9"}
        className={isBranded ? "fill-fg-accent-brand" : ""}
      />
    </g>
  </svg>
);
