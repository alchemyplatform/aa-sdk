import { EOAConnectionFailed } from "../../../../../icons/EOAConnectionFailed.js";
import { WalletConnectIcon } from "../../../../../icons/walletConnectIcon.js";

import { WALLET_CONNECT } from "../../eoa.js";
export const WalletIcon = ({
  connector,
}: {
  connector: { icon: string | undefined; name: string } | typeof WALLET_CONNECT;
}) => {
  const isWalletConnect = connector === WALLET_CONNECT;
  return (
    <div className="relative flex justify-center items-center">
      <EOAConnectionFailed.Ring />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1]">
        {isWalletConnect ? (
          <WalletConnectIcon className="w-[24px] h-[24px]" />
        ) : (
          <img
            src={connector?.icon}
            alt={connector?.name}
            height={24}
            width={24}
          />
        )}
      </div>
      <div className="absolute bottom-[0] right-[0] w-[16px] h-[16px] flex items-center justify-center z-[1]">
        <EOAConnectionFailed.Cross />
      </div>
    </div>
  );
};
