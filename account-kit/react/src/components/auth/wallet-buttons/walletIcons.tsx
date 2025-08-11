import React from "react";
import { MetaMaskIcon } from "../../../icons/metaMaskIcon.js";
import { CoinbaseIcon } from "../../../icons/coinbaseIcon.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";

type IconComponent = React.ComponentType<
  React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
>;

// Mapping for connector types to icon components
export const getConnectorIcon = (
  connectorName: string,
): IconComponent | null => {
  switch (connectorName.toLowerCase()) {
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

// Mapping for Solana adapter names to icon components
export const getSolanaAdapterIcon = (
  adapterName: string,
): IconComponent | null => {
  switch (adapterName.toLowerCase()) {
    case "phantom":
      // For now, return null as we don't have a phantom icon yet
      return null;
    case "solflare":
      // For now, return null as we don't have a solflare icon yet
      return null;
    default:
      return null;
  }
};
