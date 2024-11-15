export type CustomErrorMessage = {
  heading?: string;
  body?: string;
  tryAgainCTA?: string;
  useAnotherMethodCTA?: string;
};

export enum EOAWallets {
  COINBASE_WALLET = "com.coinbase.wallet",
  METAMASK = "io.metamask",
  WALLET_CONNECT = "WalletConnect",
}

export type ConnectionErrorProps = {
  headerText: string;
  bodyText: string;
  tryAgainCTA?: string;
  icon: React.ReactNode;
  handleTryAgain?: () => void;
  handleUseAnotherMethod?: () => void;
  shouldDisconnect?: boolean;
};
