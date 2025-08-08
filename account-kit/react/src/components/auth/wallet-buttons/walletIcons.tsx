import React from "react";
import { MetaMaskIcon } from "../../../icons/metaMaskIcon.js";
import { CoinbaseIcon } from "../../../icons/coinbaseIcon.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";

type IconComponent = React.ComponentType<
  React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
>;

// Mapping of wallet types to their built-in icon components
export const getWalletIcon = (walletType: string): IconComponent | null => {
  switch (walletType.toLowerCase()) {
    case "metamask":
      return MetaMaskIcon;
    case "coinbase wallet":
    case "coinbaseWallet":
    case "coinbase":
      return CoinbaseIcon;
    case "walletconnect":
    case "wallet connect":
      return WalletConnectIcon;
    default:
      return null;
  }
};

// Mapping for connector types to icon components
export const getConnectorIcon = (
  connectorType: string,
): IconComponent | null => {
  switch (connectorType.toLowerCase()) {
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
      // TODO: Add PhantomIcon when available
      return null;
    case "solflare":
      // For now, return null as we don't have a solflare icon yet
      // TODO: Add SolflareIcon when available
      return null;
    default:
      return null;
  }
};
