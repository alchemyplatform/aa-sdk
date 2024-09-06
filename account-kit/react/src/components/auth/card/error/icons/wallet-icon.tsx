import { CoinbaseWallet } from "../../../../../icons/coinbaseWallet.js";
import { EOAConnectionFailed } from "../../../../../icons/EOAConnectionFailed.js";
import { MetaMask } from "../../../../../icons/metamask.js";
import { WalletConnectIcon } from "../../../../../icons/walletConnectIcon.js";
import type { EOAWallets } from "../types.js";
import { walletTypeConfig } from "../connection-error.js";
import { ConnectionFailed } from "../../../../../icons/passkeyConnectionFailed.js";

export const WalletIcon = ({ walletType }: { walletType: EOAWallets }) => {
	const availableWallets = walletTypeConfig.map((w) => w.key);

	if (availableWallets.includes(walletType)) {
		return (
			<div className="relative">
				<EOAConnectionFailed />
				<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1]">
					{walletType === "io.metamask" && (
						<MetaMask className="w-[35px] h-[35px]" />
					)}
					{walletType === "WalletConnect" && (
						<WalletConnectIcon className="w-[25px] h-[25px]" />
					)}
					{walletType === "com.coinbase.wallet" && (
						<CoinbaseWallet className="w-[35px] h-[35px]" />
					)}
				</div>
			</div>
		);
	}

	// Show default connection failed Icon if wallet type is not defined
	return (
		<div className="relative">
			<ConnectionFailed />
		</div>
	);
};
