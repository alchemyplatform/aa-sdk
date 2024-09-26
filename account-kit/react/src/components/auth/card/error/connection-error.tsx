import { useMemo } from "react";
import { ls } from "../../../../strings.js";
import { Button } from "../../../button.js";
import { ConnectionFailed as PasskeyConnectionFailed } from "../../../../icons/connectionFailed.js";
import { Timeout } from "../../../../icons/timeout.js";
import { EOAWallets, type ConnectionErrorProps } from "./types.js";
import { WalletIcon } from "./icons/wallet-icon.js";

export const walletTypeConfig = [
  { name: "Coinbase Wallet", key: EOAWallets.COINBASE_WALLET },
  { name: "MetaMask", key: EOAWallets.METAMASK },
  { name: "Wallet Connect", key: EOAWallets.WALLET_CONNECT },
];

export const ConnectionError = ({
  connectionType,
  walletType,
  handleTryAgain,
  handleUseAnotherMethod,
}: ConnectionErrorProps) => {
  const getHeadingText = useMemo(() => {
    const walletName =
      walletType && walletTypeConfig.find((w) => w.key === walletType)?.name;

    switch (connectionType) {
      case "passkey":
        return ls.error.connection.passkeyTitle;
      case "wallet":
        return (
          walletType &&
          ls.error.connection.walletTitle + (walletName ?? "wallet")
        );
      case "timeout":
        return ls.error.connection.timedOutTitle;
    }
  }, [connectionType, walletType]);

  const getBodyText = useMemo(() => {
    switch (connectionType) {
      case "passkey":
        return ls.error.connection.passkeyBody;
      case "wallet":
        return ls.error.connection.walletBody;
      case "timeout":
        return ls.error.connection.timedOutBody;
    }
  }, [connectionType]);

  const getFailedIcon = useMemo(() => {
    switch (connectionType) {
      case "passkey":
        return <PasskeyConnectionFailed />;
      case "wallet":
        return walletType && <WalletIcon walletType={walletType} />;
      case "timeout":
        return <Timeout />;
    }
  }, [connectionType, walletType]);
  return (
    <div className="flex flex-col justify-center content-center gap-3">
      <div className="flex justify-center">
        <div className="w-[48px] h-[48px]">{getFailedIcon}</div>
      </div>
      <h2 className="font-semibold text-lg text-center">{getHeadingText}</h2>
      <p className="text-sm text-center text-fg-secondary">{getBodyText}</p>
      <Button className="mt-3" onClick={handleTryAgain}>
        {ls.error.cta.tryAgain}
      </Button>
      <Button
        onClick={handleUseAnotherMethod}
        variant={"social"}
        className="border-0 bg-btn-secondary"
      >
        {ls.error.cta.useAnotherMethod}
      </Button>
    </div>
  );
};
