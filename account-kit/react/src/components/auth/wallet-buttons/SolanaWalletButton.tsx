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
          <img src={iconSrc} alt={wallet.adapter.name} height={20} width={20} />
        )
      }
      onClick={handleClick}
    >
      {wallet.adapter.name}{" "}
      <span className="bg-gray-100 px-1 py-0.5 rounded-md text-xs">solana</span>
    </Button>
  );
};
