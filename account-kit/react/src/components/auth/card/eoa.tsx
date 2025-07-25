"use client";

import { walletConnect } from "wagmi/connectors";
import { useChain } from "../../../hooks/useChain.js";
import { Spinner } from "../../../icons/spinner.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";
import { ls } from "../../../strings.js";
// import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import { useAuthConfig } from "../../../hooks/internal/useAuthConfig.js";
import { CardContent } from "./content.js";
import { ConnectionError } from "./error/connection-error.js";
import { WalletIcon } from "./error/icons/wallet-icon.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnectSolanaEOA } from "../hooks/useConnectSolanaEOA.js";
import {
  WalletButton,
  WalletConnectButton,
  SolanaWalletButton,
} from "../wallet-buttons/index.js";
import type { AuthType, ExternalWalletUIConfig } from "../types.js";

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

export const EoaPickCard = () => {
  const { connectors } = useConnectEOA();
  // const { setAuthStep } = useAuthContext("pick_eoa");
  const { wallets } = useWallet();
  const { walletConnectParams } = useWalletConnectAuthConfig();

  // Get external wallets config to access logoUrl for each wallet
  const externalWalletsConfig = useAuthConfig((auth) => {
    const externalWalletSection = auth.sections
      .find((x) => x.some((y) => y.type === "external_wallets"))
      ?.find((x) => x.type === "external_wallets") as
      | Extract<AuthType, { type: "external_wallets" }>
      | undefined;

    return externalWalletSection;
  });

  // Helper function to find logoUrl for a connector
  const getLogoUrlForConnector = (
    connectorType: string,
  ): string | undefined => {
    if (!externalWalletsConfig?.wallets) return undefined;

    // Look for a wallet config with matching connector type
    const walletConfig = externalWalletsConfig.wallets.find(
      (wallet: ExternalWalletUIConfig) =>
        wallet.type === "evm" && wallet.id === connectorType,
    );
    return walletConfig?.logoUrl;
  };

  // Helper function to find logoUrl for a Solana adapter
  const getLogoUrlForAdapter = (adapterName: string): string | undefined => {
    if (!externalWalletsConfig?.wallets) return undefined;

    // Look for a wallet config with matching adapter name
    const walletConfig = externalWalletsConfig.wallets.find(
      (wallet: ExternalWalletUIConfig) =>
        wallet.type === "solana" && wallet.id === adapterName,
    );
    return walletConfig?.logoUrl;
  };

  // Helper function to find logoUrl for WalletConnect
  const getLogoUrlForWalletConnect = (): string | undefined => {
    if (!externalWalletsConfig?.wallets) return undefined;

    // Look for a wallet config with WalletConnect type
    const walletConfig = externalWalletsConfig.wallets.find(
      (wallet: ExternalWalletUIConfig) =>
        wallet.type === "walletconnect" && wallet.id === "WalletConnect",
    );
    return walletConfig?.logoUrl;
  };

  // Deduplicate connectors to prevent duplicates from auto-detection
  const uniqueConnectors = (() => {
    const uniqueMap = new Map<string, (typeof connectors)[0]>();

    connectors
      .filter((x) => x.type !== WALLET_CONNECT)
      .forEach((connector) => {
        const key = connector.name.toLowerCase();

        // If we already have this connector, prefer the explicit one over auto-detected
        // Auto-detected connectors typically have generic IDs, explicit ones have specific types
        if (!uniqueMap.has(key) || connector.type !== "injected") {
          uniqueMap.set(key, connector);
        }
      });

    return Array.from(uniqueMap.values());
  })();

  // Use reusable wallet button components with deduplicated connectors
  const connectorButtons = uniqueConnectors.map((connector) => (
    <WalletButton
      key={connector.id}
      connector={connector}
      logoUrl={getLogoUrlForConnector(connector.type)}
    />
  ));

  return (
    <CardContent
      className="w-full"
      header="Select your wallet"
      description={
        walletConnectParams != null || connectors.length || wallets.length ? (
          <div className="flex flex-col gap-3 w-full">
            {connectorButtons}
            {walletConnectParams && (
              <WalletConnectButton logoUrl={getLogoUrlForWalletConnect()} />
            )}
            {wallets.map((wallet) => (
              <SolanaWalletButton
                key={wallet.adapter.name}
                wallet={wallet}
                logoUrl={getLogoUrlForAdapter(wallet.adapter.name)}
              />
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
