export type WalletType = "CoinbaseWallet" | "MetaMask" | "WalletConnect";
export type ConnectionErrorProps = {
  connectionType: "passkey" | "wallet" | "timeout";
  walletType?: WalletType;
  handleTryAgain?: () => void;
  handleUseAnotherMethod?: () => void;
};
