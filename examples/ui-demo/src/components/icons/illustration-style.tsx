import { SVGProps } from "react";

export const IllustrationStyle = ({
  fill = "#363FF9",
  size = 48,
  variant,
  ...props
}: JSX.IntrinsicAttributes &
  SVGProps<SVGSVGElement> & { size?: number; variant: string }) => {
  switch (variant) {
    case "outline":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill={fill}
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.4588 12.751C16.2142 12.751 15.1447 13.6344 14.9096 14.8567L11.5815 32.1628C11.2736 33.7638 12.5004 35.2489 14.1307 35.2489H39.1295C40.3741 35.2489 41.4436 34.3655 41.6787 33.1433L45.0068 15.8371C45.3147 14.2362 44.0879 12.751 42.4576 12.751H17.4588ZM42.4576 14.351H17.4588C17.379 14.351 17.3011 14.3604 17.2262 14.3784L26.8748 23.6696C27.4942 24.2661 28.4495 24.3398 29.1531 23.8454L42.6406 14.3676C42.5815 14.3567 42.5203 14.351 42.4576 14.351ZM13.1527 32.4649L16.3635 15.7689L25.765 24.8221C26.9362 25.95 28.7426 26.0894 30.073 25.1545L43.3845 15.8004L40.1075 32.8411C40.0173 33.31 39.607 33.6489 39.1295 33.6489H14.1307C13.5053 33.6489 13.0346 33.0792 13.1527 32.4649Z"
            fill="currentColor"
          />
          <path
            d="M3.20039 14.547C2.75856 14.547 2.40039 14.9051 2.40039 15.347C2.40039 15.7888 2.75856 16.147 3.20039 16.147H10.5555C10.9973 16.147 11.3555 15.7888 11.3555 15.347C11.3555 14.9051 10.9973 14.547 10.5555 14.547H3.20039Z"
            fill="currentColor"
          />
          <path
            d="M9.69011 18.8734L4.06562 18.8734C3.6238 18.8734 3.26562 19.2316 3.26562 19.6734C3.26562 20.1153 3.6238 20.4734 4.06562 20.4734H9.69011C10.1319 20.4734 10.4901 20.1153 10.4901 19.6734C10.4901 19.2316 10.1319 18.8734 9.69011 18.8734Z"
            fill="currentColor"
          />
          <path
            d="M4.93105 23.2L8.82493 23.2C9.26676 23.2 9.62493 23.5582 9.62493 24C9.62493 24.4418 9.26676 24.8 8.82493 24.8L4.93105 24.8C4.48923 24.8 4.13105 24.4418 4.13105 24C4.13105 23.5582 4.48923 23.2 4.93105 23.2Z"
            fill="currentColor"
          />
        </svg>
      );
    case "linear":
      return (
        <svg
          width={size + 1}
          height={size}
          viewBox="0 0 49 48"
          fill={fill}
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path
            opacity="0.3"
            d="M34.5853 14.0488L18.1445 34.3835H40.1994C40.7101 34.3835 41.1511 34.0264 41.2574 33.527L45.1236 15.3556C45.2668 14.6826 44.7537 14.0488 44.0657 14.0488H34.5853Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.9952 12.7998C16.7505 12.7998 15.681 13.6832 15.4459 14.9055L12.1178 32.2116C11.81 33.8126 13.0367 35.2978 14.6671 35.2978H39.6658C40.9105 35.2978 41.98 34.4143 42.215 33.1921L45.5431 15.886C45.851 14.285 44.6242 12.7998 42.9939 12.7998H17.9952ZM42.9939 14.3998H17.9952C17.9154 14.3998 17.8374 14.4093 17.7626 14.4272L27.4111 23.7184C28.0305 24.3149 28.9858 24.3886 29.6894 23.8942L43.177 14.4165C43.1178 14.4055 43.0566 14.3998 42.9939 14.3998ZM13.6891 32.5138L16.8998 15.8177L26.3013 24.871C27.4725 25.9988 29.2789 26.1382 30.6093 25.2033L43.9208 15.8493L40.6438 32.8899C40.5536 33.3588 40.1433 33.6978 39.6658 33.6978H14.6671C14.0416 33.6978 13.5709 33.128 13.6891 32.5138Z"
            fill="#020617"
          />
          <path
            d="M3.86738 14.5468C3.42555 14.5468 3.06738 14.9049 3.06738 15.3468C3.06738 15.7886 3.42555 16.1468 3.86738 16.1468H11.2225C11.6643 16.1468 12.0225 15.7886 12.0225 15.3468C12.0225 14.9049 11.6643 14.5468 11.2225 14.5468H3.86738Z"
            fill="#020617"
          />
          <path
            d="M10.3571 18.8732H4.73262C4.29079 18.8732 3.93262 19.2314 3.93262 19.6732C3.93262 20.1151 4.29079 20.4732 4.73262 20.4732H10.3571C10.7989 20.4732 11.1571 20.1151 11.1571 19.6732C11.1571 19.2314 10.7989 18.8732 10.3571 18.8732Z"
            fill="#020617"
          />
          <path
            d="M5.46738 23.2488L9.36126 23.2488C9.80309 23.2488 10.1613 23.607 10.1613 24.0488C10.1613 24.4907 9.80309 24.8488 9.36126 24.8488L5.46738 24.8488C5.02556 24.8488 4.66738 24.4907 4.66738 24.0488C4.66738 23.607 5.02555 23.2488 5.46738 23.2488Z"
            fill="#020617"
          />
        </svg>
      );
    case "filled":
      return (
        <svg
          width="49"
          height={size}
          viewBox="0 0 49 48"
          fill={fill}
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path
            d="M19.2135 12.7998L27.9606 21.5834C28.5066 22.1317 29.3668 22.2107 30.0035 21.771L42.9958 12.7998H19.2135Z"
            fill="currentColor"
          />
          <path
            d="M16.2038 13.4765L26.8769 24.194C27.7627 25.0835 29.1582 25.2117 30.1913 24.4984L45.272 14.0851C45.5569 14.5956 45.6732 15.2073 45.5521 15.837L42.224 33.1431C41.9889 34.3653 40.9194 35.2488 39.6748 35.2488H14.676C13.0457 35.2488 11.819 33.7636 12.1268 32.1626L15.4549 14.8565C15.5593 14.3138 15.8282 13.8379 16.2038 13.4765Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.7334 15.1998C2.7334 14.758 3.09157 14.3998 3.5334 14.3998H10.8885C11.3303 14.3998 11.6885 14.758 11.6885 15.1998C11.6885 15.6416 11.3303 15.9998 10.8885 15.9998H3.5334C3.09157 15.9998 2.7334 15.6416 2.7334 15.1998Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.39863 18.7263L10.0231 18.7263C10.465 18.7263 10.8231 19.0844 10.8231 19.5263C10.8231 19.9681 10.465 20.3263 10.0231 20.3263H4.39863C3.9568 20.3263 3.59863 19.9681 3.59863 19.5263C3.59863 19.0844 3.9568 18.7263 4.39863 18.7263Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.26406 23.0528L9.15794 23.0528C9.59977 23.0528 9.95794 23.411 9.95794 23.8528C9.95794 24.2947 9.59977 24.6528 9.15794 24.6528L5.26406 24.6528C4.82223 24.6528 4.46406 24.2947 4.46406 23.8528C4.46406 23.411 4.82223 23.0528 5.26406 23.0528Z"
            fill="currentColor"
          />
        </svg>
      );
    case "flat":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill={fill}
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <path
            opacity="0.3"
            d="M15.8706 13.4766L26.5437 24.1941C27.4295 25.0836 28.825 25.2118 29.8581 24.4985L44.9388 14.0852C45.2237 14.5957 45.34 15.2074 45.2189 15.8371L41.8908 33.1432C41.6557 34.3654 40.5862 35.2489 39.3416 35.2489H14.3428C12.7125 35.2489 11.4857 33.7637 11.7936 32.1627L15.1217 14.8566C15.2261 14.3139 15.495 13.838 15.8706 13.4766Z"
            fill="currentColor"
          />
          <path
            d="M18.8805 12.7998L27.6276 21.5834C28.1736 22.1317 29.0337 22.2107 29.6705 21.771L42.6628 12.7998H18.8805Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.40039 15.1998C2.40039 14.758 2.75856 14.3998 3.20039 14.3998H10.5555C10.9973 14.3998 11.3555 14.758 11.3555 15.1998C11.3555 15.6416 10.9973 15.9998 10.5555 15.9998H3.20039C2.75856 15.9998 2.40039 15.6416 2.40039 15.1998Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06562 18.7263L9.69011 18.7263C10.1319 18.7263 10.4901 19.0844 10.4901 19.5263C10.4901 19.9681 10.1319 20.3263 9.69011 20.3263L4.06562 20.3263C3.6238 20.3263 3.26562 19.9681 3.26562 19.5263C3.26562 19.0844 3.6238 18.7263 4.06562 18.7263Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.93105 23.0528L8.82493 23.0528C9.26676 23.0528 9.62493 23.411 9.62493 23.8528C9.62493 24.2947 9.26676 24.6528 8.82493 24.6528L4.93105 24.6528C4.48923 24.6528 4.13105 24.2947 4.13105 23.8528C4.13105 23.411 4.48923 23.0528 4.93105 23.0528Z"
            fill="currentColor"
          />
        </svg>
      );
  }
};