export type WalletType =
  | "com.coinbase.wallet"
  | "io.metamask"
  | "WalletConnect";

export type ConnectionErrorProps = {
  connectionType: "passkey" | "wallet" | "timeout";
  walletType?: WalletType;
  handleTryAgain?: () => void;
  handleUseAnotherMethod?: () => void;
};
