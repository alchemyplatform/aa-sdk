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
        {walletType === "MetaMask" && (
          <MetaMask className="w-[25px] h-[25px]" />
        )}
        {walletType === "WalletConnect" && (
          <WalletConnectIcon className="w-[25px] h-[25px]" />
        )}
        {walletType === "CoinbaseWallet" && (
          <CoinbaseWallet className="w-[25px] h-[25px]" />
        )}
      </div>
    </div>
  );
};
