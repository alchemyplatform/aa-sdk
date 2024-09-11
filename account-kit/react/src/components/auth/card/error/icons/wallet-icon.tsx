import { CoinbaseWallet } from "../../../../../icons/coinbaseWallet.js";
import { EOAConnectionFailed } from "../../../../../icons/EOAConnectionFailed.js";
import { MetaMask } from "../../../../../icons/metamask.js";
import { WalletConnectIcon } from "../../../../../icons/walletConnectIcon.js";
import type { WalletType } from "../types.js";

export const WalletIcon = ({ walletType }: { walletType: WalletType }) => {
  return (
    <div className="relative">
      <EOAConnectionFailed />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1]">
        {walletType === "MetaMask" && <MetaMask />}
        {walletType === "WalletConnect" && <WalletConnectIcon />}
        {walletType === "CoinbaseWallet" && <CoinbaseWallet />}
      </div>
    </div>
  );
};
