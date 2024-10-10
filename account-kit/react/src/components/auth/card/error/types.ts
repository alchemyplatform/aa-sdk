import type { Connector } from "@wagmi/core";
import type { KnownAuthProvider } from "../../../../../../signer/dist/types/signer";
export enum EOAWallets {
  COINBASE_WALLET = "com.coinbase.wallet",
  METAMASK = "io.metamask",
  WALLET_CONNECT = "WalletConnect",
}

export type ConnectionErrorProps = {
  connectionType: "passkey" | "oauth" | "wallet" | "timeout";
  oauthProvider?: KnownAuthProvider; // TO DO: extend for BYO auth provider
  EOAConnector?: Connector | EOAWallets.WALLET_CONNECT;
  handleTryAgain?: () => void;
  handleUseAnotherMethod?: () => void;
};
