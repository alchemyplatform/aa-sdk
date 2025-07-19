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
import { useConnectSolanaEOA } from "../hooks/useConnectSolanaEOA.js";

export const WALLET_CONNECT = "walletConnect";

export const EoaConnectCard = () => {
  const { setAuthStep, authStep } = useAuthContext("eoa_connect");
  const { connect: connectEvm } = useConnectEOA();
  const { connect: connectSolana } = useConnectSolanaEOA();
  const { chain } = useChain();

  const connector =
    authStep.chain === "evm"
      ? { icon: authStep.connector.icon, name: authStep.connector.name }
      : {
          icon: authStep.wallet.adapter.icon,
          name: authStep.wallet.adapter.name,
        };

  if (authStep.error) {
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
            ...(authStep.chain === "evm"
              ? { connector: authStep.connector, chain: "evm" }
              : { wallet: authStep.wallet, chain: "svm" }),
          });

          if (authStep.chain === "evm") {
            connectEvm({
              connector: authStep.connector,
              chainId: chain.id,
            });
          } else {
            connectSolana(authStep.wallet);
          }
        }}
        handleUseAnotherMethod={() => setAuthStep({ type: "pick_eoa" })}
      />
    );
  }

  return (
    <CardContent
      header={`Connecting to ${connector?.name}`}
      className={"gap-0"}
      icon={
        <div className="flex relative flex-col items-center justify-center h-[58px] w-[58px] mb-5">
          <img
            className={authStep.error ? undefined : "animate-pulse"}
            src={connector?.icon}
            alt={connector?.name}
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
  const { connect } = useConnectSolanaEOA();

  return (
    <Button
      className="justify-start"
      variant="social"
      icon={
        wallet.adapter.icon && (
          <img
            src={wallet.adapter.icon}
            alt={wallet.adapter.name}
            height={20}
            width={20}
          />
        )
      }
      onClick={() => connect(wallet)}
    >
      {wallet.adapter.name}{" "}
      <span className="bg-gray-100 px-1 py-0.5 rounded-md text-xs">solana</span>
    </Button>
  );
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
