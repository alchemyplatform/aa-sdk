import { EOAConnectionFailed } from "../../../../../icons/EOAConnectionFailed.js";
import { EOAWallets } from "../types.js";
import { walletTypeConfig } from "../connection-error.js";
import { ConnectionFailed } from "../../../../../icons/connectionFailed.js";

export const WalletIcon = ({ walletType }: { walletType: EOAWallets }) => {
  const availableWallets = walletTypeConfig.map((w) => w.key);

  if (availableWallets.includes(walletType)) {
    return (
      <div className="relative">
        <EOAConnectionFailed walletType={walletType} />
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
