import type { Connector } from "wagmi";
import { Button } from "../../button.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useChain } from "../../../hooks/useChain.js";
import type { WalletButtonProps } from "./types.js";
import { getConnectorIcon } from "./walletIcons.js";

interface EVMWalletButtonProps extends WalletButtonProps {
  connector: Connector;
}

export const WalletButton = ({
  connector,
  className,
  onClick,
}: EVMWalletButtonProps) => {
  const { chain } = useChain();
  const { connect } = useConnectEOA();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    connect({ connector, chainId: chain.id });
  };

  // Get the built-in icon component for this connector type
  const IconComponent = getConnectorIcon(connector.type);

  // Fallback to connector.icon if no built-in icon is available
  const fallbackIconSrc = connector.icon;

  const renderIcon = () => {
    if (IconComponent) {
      return <IconComponent />;
    }

    if (fallbackIconSrc) {
      return (
        <img
          src={fallbackIconSrc}
          alt={connector.name}
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
    >
      {connector.name}
    </Button>
  );
};
