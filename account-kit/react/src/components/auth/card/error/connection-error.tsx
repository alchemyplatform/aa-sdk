import { useMemo } from "react";
import { ls } from "../../../../strings.js";
import { Button } from "../../../button.js";
import { PasskeyConnectionFailed } from "../../../../icons/passkeyConnectionFailed.js";
import { Timeout } from "../../../../icons/timeout.js";
import type { ConnectionErrorProps, WalletType } from "./types.js";
import { WalletIcon } from "./icons/wallet-icon.js";

export const walletTypeConfig: Record<
  WalletType,
  { name: string; key: WalletType }
> = {
  CoinbaseWallet: { name: "Coinbase Wallet", key: "CoinbaseWallet" },
  MetaMask: { name: "MetaMask", key: "MetaMask" },
  WalletConnect: { name: "Wallet Connect", key: "WalletConnect" },
};

export const ConnectionError = ({
  connectionType,
  walletType,
  handleTryAgain,
  handleUseAnotherMethod,
}: ConnectionErrorProps) => {
  const getHeadingText = useMemo(() => {
    switch (connectionType) {
      case "passkey":
        return ls.error.connection.passkeyTitle;
      case "wallet":
        return (
          walletType &&
          ls.error.connection.walletTitle + walletTypeConfig[walletType].name
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
        <div className="w-[140px] h-[140px]">{getFailedIcon}</div>
      </div>
      <h2 className="font-semibold text-lg text-center">{getHeadingText}</h2>
      <p className="text-sm text-center text-fg-secondary">{getBodyText}</p>
      <Button className="mt-3" onClick={handleTryAgain}>
        {ls.error.cta.tryAgain}
      </Button>
      <Button
        onClick={handleUseAnotherMethod}
        variant={"social"}
        className="border-0 hover:shadow-none"
      >
        {ls.error.cta.useAnotherMethod}
      </Button>
    </div>
  );
};
