import type { Wallet } from "@solana/wallet-adapter-react";
import { Button } from "../../button.js";
import { useConnectSolanaEOA } from "../hooks/useConnectSolanaEOA.js";
import type { WalletButtonProps } from "./types.js";
import { getWalletIcon } from "./walletIcons.js";

interface SolanaWalletButtonProps extends WalletButtonProps {
  wallet: Wallet;
}

export const SolanaWalletButton = ({
  wallet,
  className,
  onClick,
}: SolanaWalletButtonProps) => {
  const { connect } = useConnectSolanaEOA();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    connect(wallet);
  };

  // Get the built-in icon component for this adapter
  const IconComponent = getWalletIcon(wallet.adapter.name);

  // Fallback to wallet.adapter.icon if no built-in icon is available
  const fallbackIconSrc = wallet.adapter.icon;

  const renderIcon = () => {
    if (IconComponent) {
      return <IconComponent />;
    }

    if (fallbackIconSrc) {
      return (
        <img
          src={fallbackIconSrc}
          alt={wallet.adapter.name}
          height={24}
          width={24}
        />
      );
    }

    return null;
  };

  return (
    <Button
      className={`justify-start ${className ?? ""}`}
      variant="social"
      icon={renderIcon()}
      onClick={handleClick}
      fullWidthContent={true}
    >
      <div className="flex items-center justify-between w-full">
        <span>{wallet.adapter.name}</span>
        <span className="bg-bg-surface-inset px-1 rounded-sm text-xs font-medium h-4 flex items-center gap-1 leading-4 text-fg-tertiary">
          Solana
        </span>
      </div>
    </Button>
  );
};
