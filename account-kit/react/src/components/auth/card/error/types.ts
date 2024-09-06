export enum EOAWallets {
	COINBASE_WALLET = "com.coinbase.wallet",
	METAMASK = "io.metamask",
	WALLET_CONNECT = "WalletConnect",
}

export type ConnectionErrorProps = {
	connectionType: "passkey" | "wallet" | "timeout";
	walletType?: EOAWallets;
	handleTryAgain?: () => void;
	handleUseAnotherMethod?: () => void;
};
