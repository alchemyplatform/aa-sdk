import type { Wallet } from "@solana/wallet-adapter-react";
import { Button } from "../../button.js";
import { useConnectSolanaEOA } from "../hooks/useConnectSolanaEOA.js";
import type { WalletButtonProps } from "./types.js";

interface SolanaWalletButtonProps extends WalletButtonProps {
  wallet: Wallet;
}

export const SolanaWalletButton = ({
  wallet,
  className,
  onClick,
  logoUrl,
}: SolanaWalletButtonProps) => {
  const { connect } = useConnectSolanaEOA();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    connect(wallet);
  };

  const iconSrc = logoUrl || wallet.adapter.icon;

  return (
    <Button
      className={`justify-start ${className ?? ""}`}
      variant="social"
      icon={
        iconSrc && (
          <img src={iconSrc} alt={wallet.adapter.name} height={24} width={24} />
        )
      }
      onClick={handleClick}
      fullWidthContent={true}
    >
      <div className="flex items-center justify-between w-full">
        <span>{wallet.adapter.name}</span>
        <span className="bg-bg-surface-inset px-1 rounded-sm text-xs font-medium h-4 flex items-center gap-1 leading-4 text-fg-tertiary">
          solana
        </span>
      </div>
    </Button>
  );
};
