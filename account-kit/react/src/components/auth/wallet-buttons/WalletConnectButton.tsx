import { walletConnect } from "wagmi/connectors";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";
import { Button } from "../../button.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useChain } from "../../../hooks/useChain.js";
import { useAuthContext } from "../context.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import type { WalletButtonProps } from "./types.js";

export const WalletConnectButton = ({
  className,
  onClick,
  logoUrl,
}: WalletButtonProps) => {
  const { chain } = useChain();
  const { connect } = useConnectEOA();
  const { setAuthStep } = useAuthContext();
  const { walletConnectParams } = useWalletConnectAuthConfig();

  const walletConnectConnector = walletConnectParams
    ? walletConnect(walletConnectParams)
    : null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    // If walletConnectConnector is not found, set the error and return
    if (!walletConnectConnector) {
      return setAuthStep({
        type: "wallet_connect",
        error: new Error("WalletConnect params not found"),
      });
    }

    connect({
      connector: walletConnectConnector,
      chainId: chain.id,
    });
  };

  if (!walletConnectConnector) {
    return null;
  }

  return (
    <Button
      className={`justify-start ${className ?? ""}`}
      variant="social"
      icon={
        logoUrl ? (
          <img src={logoUrl} alt="WalletConnect" height={20} width={20} />
        ) : (
          <WalletConnectIcon className="w-[25px] h-[25px]" />
        )
      }
      onClick={handleClick}
    >
      WalletConnect
    </Button>
  );
};
