import type { Connector } from "@wagmi/core";
export enum EOAWallets {
  COINBASE_WALLET = "com.coinbase.wallet",
  METAMASK = "io.metamask",
  WALLET_CONNECT = "WalletConnect",
}

export type ConnectionErrorProps = {
  connectionType: "passkey" | "wallet" | "timeout";
  EOAConnector?: Connector | EOAWallets.WALLET_CONNECT;
  handleTryAgain?: () => void;
  handleUseAnotherMethod?: () => void;
};
