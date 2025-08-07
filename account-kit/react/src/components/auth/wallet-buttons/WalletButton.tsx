import type { Connector } from "wagmi";
import { Button } from "../../button.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useChain } from "../../../hooks/useChain.js";
import type { WalletButtonProps } from "./types.js";

interface EVMWalletButtonProps extends WalletButtonProps {
  connector: Connector;
}

export const WalletButton = ({
  connector,
  className,
  onClick,
  logoUrl,
}: EVMWalletButtonProps) => {
  const { chain } = useChain();
  const { connect } = useConnectEOA();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    connect({ connector, chainId: chain.id });
  };

  const iconSrc = logoUrl || connector.icon;

  return (
    <Button
      className={`justify-start ${className ?? ""}`}
      variant="social"
      icon={
        iconSrc && (
          <img src={iconSrc} alt={connector.name} height={24} width={24} />
        )
      }
      onClick={handleClick}
    >
      {connector.name}
    </Button>
  );
};
