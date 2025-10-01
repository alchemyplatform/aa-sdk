import type { WalletAdapter } from "@solana/wallet-adapter-base";
import type { Connector, CreateConnectorFn } from "wagmi";

export interface WalletButtonProps {
  className?: string;
  onClick?: () => void;
}

export interface WalletInfo {
  id: string;
  name: string;
  icon?: string;
  type: "evm" | "solana" | "walletconnect";
  // Store the actual objects for direct access
  adapter?: WalletAdapter;
  connector?: Connector;
}

export type WalletReference =
  | WalletAdapter
  | Connector
  | CreateConnectorFn
  | string;
