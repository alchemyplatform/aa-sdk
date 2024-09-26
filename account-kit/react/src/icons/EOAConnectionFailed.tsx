import { type SVGProps } from "react";
import { EOAWallets } from "../components/auth/card/error/types.js";
import { useUiConfig } from "../hooks/useUiConfig.js";

type EOAConnectionFailedProps = {
  walletType: EOAWallets;
};
export const EOAConnectionFailed = ({
  className,
  walletType,
  ...props
}: EOAConnectionFailedProps &
  JSX.IntrinsicAttributes &
  SVGProps<SVGSVGElement>) => {
  const { illustrationStyle } = useUiConfig();
  const isRingGrey =
    illustrationStyle === "filled" || illustrationStyle === "flat";

  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g>
        {/* Outer Ring */}
        <path
          className={
            isRingGrey
              ? "stroke-[#F87171] dark:[#CBDFE1]"
              : "stroke-[#F87171] dark:[#B91C1C]"
          }
          d="M24 46C36.1503 46 46 36.1503 46 24C46 11.8497 36.1503 2 24 2C11.8497 2 2 11.8497 2 24C2 36.1503 11.8497 46 24 46Z"
          stroke="#B91C1C"
          strokeWidth="2.5"
        />
        <path
          d="M50 41C50 36.0294 45.9706 32 41 32C36.0294 32 32 36.0294 32 41C32 45.9706 36.0294 50 41 50C45.9706 50 50 45.9706 50 41Z"
          fill="#DC2626"
        />
        <path
          d="M43 39L39 43M43 43L39 39"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </g>
      {/* Metamask logo */}
      {walletType === EOAWallets.METAMASK && <MetamaskIconPath />}
      {/* Coinbase logo */}
      {walletType === EOAWallets.COINBASE_WALLET && <CoinbaseIconPath />}
      {/* WalletConnect logo */}
      {walletType === EOAWallets.WALLET_CONNECT && <WalletConnectIconPath />}
    </svg>
  );
};

const MetamaskIconPath = () => (
  <g>
    <path
      d="M34.0883 13.1191L25.3438 19.6138L26.9608 15.782L34.0883 13.1191Z"
      fill="#E2761B"
      stroke="#E2761B"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.9033 13.1191L22.5775 19.6753L21.0395 15.782L13.9033 13.1191ZM30.9441 28.1738L28.6151 31.7419L33.5982 33.1129L35.0307 28.2528L30.9441 28.1738ZM12.9805 28.2528L14.4042 33.1129L19.3872 31.7419L17.0583 28.1738L12.9805 28.2528Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.1034 22.1463L17.7148 24.2467L22.6627 24.4664L22.487 19.1494L19.1034 22.1463ZM28.885 22.1463L25.4575 19.0879L25.3432 24.4664L30.2823 24.2467L28.885 22.1463ZM19.3846 31.7433L22.3551 30.2932L19.7889 28.2894L19.3846 31.7433ZM25.6332 30.2932L28.6125 31.7433L28.1995 28.2894L25.6332 30.2932Z"
      fill="#E4761B"
      stroke="#E4761B"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28.6146 31.7431L25.6353 30.293L25.8726 32.2352L25.8462 33.0525L28.6146 31.7431ZM19.3867 31.7431L22.1551 33.0525L22.1375 32.2352L22.3572 30.293L19.3867 31.7431Z"
      fill="#D7C1B3"
      stroke="#D7C1B3"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.1971 27.0058L19.7188 26.2763L21.4677 25.4766L22.1971 27.0058ZM25.7916 27.0058L26.521 25.4766L28.2787 26.2763L25.7916 27.0058Z"
      fill="#233447"
      stroke="#233447"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.3836 31.7426L19.8055 28.1745L17.0547 28.2536L19.3836 31.7426ZM28.1897 28.1745L28.6115 31.7426L30.9404 28.2536L28.1897 28.1745ZM30.2813 24.2461L25.3422 24.4658L25.7992 27.0057L26.5286 25.4765L28.2863 26.2762L30.2813 24.2461ZM19.7176 26.2762L21.4753 25.4765L22.1959 27.0057L22.6617 24.4658L17.7138 24.2461L19.7176 26.2762Z"
      fill="#CD6116"
      stroke="#CD6116"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.7148 24.2461L19.7889 28.2888L19.7186 26.2762L17.7148 24.2461ZM28.2873 26.2762L28.1995 28.2888L30.2823 24.2461L28.2873 26.2762ZM22.6627 24.4658L22.197 27.0057L22.777 30.0025L22.9088 26.0565L22.6627 24.4658ZM25.3432 24.4658L25.1059 26.0477L25.2114 30.0025L25.8002 27.0057L25.3432 24.4658Z"
      fill="#E4751F"
      stroke="#E4751F"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25.8004 27.0048L25.2115 30.0017L25.6334 30.2917L28.1996 28.2879L28.2875 26.2754L25.8004 27.0048ZM19.7188 26.2754L19.7891 28.2879L22.3553 30.2917L22.7771 30.0017L22.1971 27.0048L19.7188 26.2754Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25.8462 33.0517L25.8726 32.2343L25.6529 32.041H22.3396L22.1375 32.2343L22.1551 33.0517L19.3867 31.7422L20.3534 32.5331L22.3133 33.8954H25.6792L27.6479 32.5331L28.6146 31.7422L25.8462 33.0517Z"
      fill="#C0AD9E"
      stroke="#C0AD9E"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M25.6345 30.292L25.2127 30.002H22.7783L22.3564 30.292L22.1367 32.2342L22.3389 32.0409H25.6521L25.8718 32.2342L25.6345 30.292Z"
      fill="#161616"
      stroke="#161616"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M34.4565 20.0357L35.2035 16.45L34.0874 13.1191L25.6329 19.3941L28.8846 22.1449L33.481 23.4895L34.5004 22.3031L34.061 21.9867L34.7641 21.3451L34.2192 20.9233L34.9223 20.3872L34.4565 20.0357ZM12.793 16.45L13.54 20.0357L13.0654 20.3872L13.7685 20.9233L13.2324 21.3451L13.9355 21.9867L13.496 22.3031L14.5067 23.4895L19.1031 22.1449L22.3548 19.3941L13.9003 13.1191L12.793 16.45Z"
      fill="#763D16"
      stroke="#763D16"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M33.4839 23.4907L28.8876 22.146L30.2849 24.2465L28.2021 28.2892L30.9441 28.254H35.0307L33.4839 23.4907ZM19.106 22.146L14.5097 23.4907L12.9805 28.254H17.0583L19.7915 28.2892L17.7174 24.2465L19.106 22.146ZM25.3458 24.4662L25.6358 19.3953L26.9717 15.7832H21.0395L22.3577 19.3953L22.6653 24.4662L22.7708 26.0657L22.7796 30.0029H25.214L25.2316 26.0657L25.3458 24.4662Z"
      fill="#F6851B"
      stroke="#F6851B"
      strokeWidth="0.0878845"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

const CoinbaseIconPath = () => (
  <g>
    <path
      d="M24.5 34C30.299 34 35 29.299 35 23.5C35 17.701 30.299 13 24.5 13C18.701 13 14 17.701 14 23.5C14 29.299 18.701 34 24.5 34Z"
      fill="#0052FF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.1484 23.5004C17.1484 27.5604 20.4384 30.8504 24.4984 30.8504C28.5584 30.8504 31.8484 27.5604 31.8484 23.5004C31.8484 19.4404 28.5584 16.1504 24.4984 16.1504C20.4384 16.1504 17.1484 19.4404 17.1484 23.5004ZM22.6224 21.1297C22.3518 21.1297 22.1324 21.3491 22.1324 21.6197V25.3764C22.1324 25.6471 22.3518 25.8664 22.6224 25.8664H26.3791C26.6498 25.8664 26.8691 25.6471 26.8691 25.3764V21.6197C26.8691 21.3491 26.6498 21.1297 26.3791 21.1297H22.6224Z"
      fill="white"
    />
  </g>
);

const WalletConnectIconPath = () => (
  <g>
    <path
      d="M43 39L39 43M43 43L39 39"
      stroke="white"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <mask
      id="mask0_80810_186"
      style={{ maskType: "luminance" }}
      maskUnits="userSpaceOnUse"
      x="10"
      y="10"
      width="28"
      height="28"
    >
      <path
        d="M37.5984 10.4004H10.3984V37.6004H37.5984V10.4004Z"
        fill="white"
      />
    </mask>
    <g mask="url(#mask0_80810_186)">
      <path
        d="M15.9435 19.4775C20.6127 14.9059 28.1829 14.9059 32.8522 19.4775L33.4141 20.0276C33.6475 20.2562 33.6475 20.6268 33.4141 20.8554L31.4918 22.7375C31.375 22.8518 31.1858 22.8518 31.069 22.7375L30.2958 21.9804C27.0384 18.7912 21.7572 18.7912 18.4999 21.9804L17.6717 22.7912C17.555 22.9055 17.3658 22.9055 17.249 22.7912L15.3268 20.9091C15.0932 20.6805 15.0932 20.3099 15.3268 20.0813L15.9435 19.4775ZM36.8276 23.3698L38.5385 25.0449C38.772 25.2735 38.772 25.644 38.5385 25.8726L30.8242 33.4258C30.5907 33.6543 30.2122 33.6543 29.9787 33.4258L24.5035 28.0651C24.4452 28.0079 24.3505 28.0079 24.2922 28.0651L18.8171 33.4258C18.5837 33.6543 18.2051 33.6543 17.9717 33.4258L10.2571 25.8726C10.0237 25.644 10.0237 25.2734 10.2571 25.0448L11.968 23.3697C12.2014 23.1412 12.58 23.1412 12.8134 23.3697L18.2887 28.7304C18.347 28.7876 18.4416 28.7876 18.5 28.7304L23.975 23.3697C24.2084 23.1412 24.587 23.1412 24.8204 23.3697L30.2957 28.7304C30.3541 28.7876 30.4487 28.7876 30.5071 28.7304L35.9822 23.3698C36.2157 23.1412 36.5942 23.1412 36.8276 23.3698Z"
        fill="#3396FF"
      />
    </g>
  </g>
);
