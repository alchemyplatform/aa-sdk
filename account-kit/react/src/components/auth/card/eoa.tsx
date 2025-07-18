"use client";

import { walletConnect } from "wagmi/connectors";
import { useChain } from "../../../hooks/useChain.js";
import { Spinner } from "../../../icons/spinner.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";
import { ls } from "../../../strings.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import { CardContent } from "./content.js";
import { ConnectionError } from "./error/connection-error.js";
import { WalletIcon } from "./error/icons/wallet-icon.js";
import { useWallet, type Wallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

export const WALLET_CONNECT = "walletConnect";

export const EoaConnectCard = () => {
  const { setAuthStep, authStep } = useAuthContext("eoa_connect");
  const { connect } = useConnectEOA();
  const { chain } = useChain();

  const connector = authStep.connector;

  if (authStep.error && connector) {
    const errorMessage = getErrorMessage(authStep.error, connector.name);
    return (
      <ConnectionError
        icon={<WalletIcon connector={connector} />}
        headerText={errorMessage.heading}
        bodyText={errorMessage.body}
        tryAgainCTA={errorMessage.tryAgainCTA}
        handleTryAgain={() => {
          setAuthStep({
            type: "eoa_connect",
            connector: connector,
          });

          // Re-try connector's connection...
          connect({
            connector: connector,
            chainId: chain.id,
          });
        }}
        handleUseAnotherMethod={() => setAuthStep({ type: "pick_eoa" })}
      />
    );
  }

  return (
    <CardContent
      header={`Connecting to ${authStep.connector?.name}`}
      className={"gap-0"}
      icon={
        <div className="flex relative flex-col items-center justify-center h-[58px] w-[58px] mb-5">
          <img
            className={authStep.error ? undefined : "animate-pulse"}
            src={authStep.connector?.icon}
            alt={authStep.connector?.name}
            height={28}
            width={28}
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1]">
            <Spinner />
          </div>
        </div>
      }
      description="Please follow the instructions in your wallet to connect."
      error={authStep.error}
      secondaryButton={{
        title: "Cancel",
        onClick: async () => {
          setAuthStep({ type: "initial" });
        },
      }}
    />
  );
};

export const WalletConnectCard = () => {
  const { setAuthStep, authStep } = useAuthContext("wallet_connect");
  const { walletConnectParams } = useWalletConnectAuthConfig();
  const { chain } = useChain();

  const walletConnectConnector = walletConnectParams
    ? walletConnect(walletConnectParams)
    : null;

  const { connect } = useConnectEOA();

  if (!walletConnectConnector) {
    setAuthStep({
      type: "wallet_connect",
      error: new Error("WalletConnect params not found"),
    });

    return null;
  }

  if (authStep.error) {
    const errorMessage = getErrorMessage(authStep.error, WALLET_CONNECT);

    return (
      <ConnectionError
        headerText={errorMessage.heading}
        bodyText={errorMessage.body}
        tryAgainCTA={errorMessage.tryAgainCTA}
        icon={<WalletIcon connector={WALLET_CONNECT} />}
        handleTryAgain={() => {
          setAuthStep({ type: "wallet_connect" });
          // Re-try wallet connect's connection...
          connect({
            connector: walletConnectConnector,
            chainId: chain.id,
          });
        }}
        handleUseAnotherMethod={() => setAuthStep({ type: "pick_eoa" })}
      />
    );
  }

  // If error render the error card here?
  return (
    <CardContent
      header={`Connecting to WalletConnect`}
      className={"gap-0"}
      icon={
        <div className="flex relative flex-col items-center justify-center h-[58px] w-[58px] mb-5">
          <WalletConnectIcon
            className={
              "w-[32px] h-[32px]" + (authStep.error ? "" : " animate-pulse")
            }
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1]">
            <Spinner />
          </div>
        </div>
      }
      description={"Please follow the instructions in the popup to connect."}
      error={authStep.error}
      secondaryButton={{
        title: "Cancel",
        onClick: async () => {
          // Ensure to stop all inflight requests
          setAuthStep({ type: "initial" });
        },
      }}
    />
  );
};

function SolanaLoginButton({ wallet }: { wallet: Wallet }) {
  const { setAuthStep } = useAuthContext();
  const {
    connect,
    connecting,
    connected,
    select,
    wallet: selectedWallet,
  } = useWallet();

  const handleClick = () => {
    select(wallet.adapter.name);
  };

  useEffect(() => {
    if (selectedWallet?.adapter.name !== wallet.adapter.name) return;
    if (connected || connecting) return;
    setAuthStep({ type: "eoa_connect" });
    connect()
      .then((e) => {
        console.log(e, "complete");
        console.log("complete");
        setAuthStep({ type: "complete" });
      })
      .catch((error) => {
        setAuthStep({ type: "eoa_connect", error });
      });
  }, [selectedWallet, wallet, connect, connected, connecting]);

  console.log(selectedWallet, wallet, connected, "selectedWallet");

  return <Button onClick={handleClick}>{wallet.adapter.name}</Button>;
}

export const EoaPickCard = () => {
  const { chain } = useChain();
  const { connectors, connect } = useConnectEOA();
  const { setAuthStep } = useAuthContext("pick_eoa");
  const { wallets } = useWallet();

  const { walletConnectParams } = useWalletConnectAuthConfig();

  const connectorButtons = connectors
    .filter((x) => x.type !== WALLET_CONNECT)
    .map((connector) => {
      return (
        <Button
          className="justify-start"
          variant="social"
          key={connector.id}
          icon={
            connector.icon && (
              <img
                src={connector.icon}
                alt={connector.name}
                height={20}
                width={20}
              />
            )
          }
          onClick={() => {
            connect({ connector, chainId: chain.id });
          }}
        >
          {connector.name}
        </Button>
      );
    });

  const walletConnectConnector = walletConnectParams
    ? walletConnect(walletConnectParams)
    : null;

  return (
    <CardContent
      className="w-full"
      header="Select your wallet"
      description={
        walletConnectConnector != null || connectors.length ? (
          <div className="flex flex-col gap-3 w-full">
            {connectorButtons}
            {walletConnectConnector && (
              <Button
                className="justify-start"
                variant="social"
                icon={<WalletConnectIcon className="w-[25px] h-[25px]" />}
                onClick={() => {
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
                }}
              >
                WalletConnect
              </Button>
            )}
            {wallets.map((wallet) => (
              <SolanaLoginButton key={wallet.adapter.name} wallet={wallet} />
            ))}
          </div>
        ) : (
          "No wallets available"
        )
      }
    />
  );
};

const getErrorMessage = (error: Error, walletName: string) => {
  if (error.message.includes("ChainId not found")) {
    return ls.error.customErrorMessages.eoa.walletConnect.chainIdNotFound;
  }

  if (error.message.includes("WalletConnect params not found")) {
    return ls.error.customErrorMessages.eoa.walletConnect
      .walletConnectParamsNotFound;
  }

  // Use default error message
  return {
    ...ls.error.customErrorMessages.eoa.default,
    heading: `${ls.error.customErrorMessages.eoa.default.heading} ${walletName}`,
  };
};
