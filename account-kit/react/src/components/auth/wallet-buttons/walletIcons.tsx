import React from "react";
import { MetaMaskIcon } from "../../../icons/metaMaskIcon.js";
import { CoinbaseIcon } from "../../../icons/coinbaseIcon.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";

type IconComponent = React.ComponentType<
  React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
>;

export const getWalletIcon = (walletName: string): IconComponent | null => {
  switch (walletName.toLowerCase()) {
    case "metamask":
      return MetaMaskIcon;
    case "coinbasewallet":
    case "coinbase wallet":
      return CoinbaseIcon;
    case "walletconnect":
      return WalletConnectIcon;
    default:
      return null;
  }
};
