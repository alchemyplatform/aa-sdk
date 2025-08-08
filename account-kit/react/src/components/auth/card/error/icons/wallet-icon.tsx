import { EOAConnectionFailed } from "../../../../../icons/EOAConnectionFailed.js";
import { WalletConnectIcon } from "../../../../../icons/walletConnectIcon.js";
import { getConnectorIcon } from "../../../wallet-buttons/walletIcons.js";

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
          <>
            {connector?.icon ? (
              <img
                src={connector.icon}
                alt={connector.name}
                height={24}
                width={24}
              />
            ) : (
              // Try to use built-in icon as fallback
              (() => {
                const IconComponent = getConnectorIcon(connector.name);
                return IconComponent ? (
                  <IconComponent width={24} height={24} />
                ) : (
                  // If no built-in icon exists, render a blank space with dimensions
                  <div style={{ width: 24, height: 24 }} />
                );
              })()
            )}
          </>
        )}
      </div>
      <div className="absolute bottom-[0] right-[0] w-[16px] h-[16px] flex items-center justify-center z-[1]">
        <EOAConnectionFailed.Cross />
      </div>
    </div>
  );
};
