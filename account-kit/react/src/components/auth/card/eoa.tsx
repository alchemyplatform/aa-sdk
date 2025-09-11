// eoa.tsx
"use client";

import { walletConnect } from "wagmi/connectors";
import { useChain } from "../../../hooks/useChain.js";
import { Spinner } from "../../../icons/spinner.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";
import { ls } from "../../../strings.js";
import { useAuthContext } from "../context.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import { CardContent } from "./content.js";
import { ConnectionError } from "./error/connection-error.js";
import { WalletIcon } from "./error/icons/wallet-icon.js";
import { useConnectSolanaEOA } from "../hooks/useConnectSolanaEOA.js";
import {
  WalletButton,
  WalletConnectButton,
  SolanaWalletButton,
} from "../wallet-buttons/index.js";
import { useWalletAvailability } from "../../../hooks/internal/useWalletDeduplication.js";
import { getWalletIcon } from "../wallet-buttons/walletIcons.js";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import { useMemo } from "react";

export const WALLET_CONNECT = "walletConnect";

const norm = (s?: string) => (s ?? "").toLowerCase();
const isWC = (name: string) => {
  const n = norm(name);
  return (
    n === "wallet_connect" || n === "wallet connect" || n === "walletconnect"
  );
};
const orderChains = (chains: string[]) =>
  [...chains].sort((a, b) =>
    a === "evm" && b === "svm" ? -1 : a === "svm" && b === "evm" ? 1 : 0,
  );

// Find the external_wallets section whether it's at config.sections or nested in config.auth.sections (possibly grouped)
const getExternalWalletsSection = (
  cfg: any,
):
  | { type: "external_wallets"; wallets?: string[]; chainType?: string[] }
  | undefined => {
  const pick = (arr: any[]) =>
    arr?.find(
      (s) => s && typeof s === "object" && s.type === "external_wallets",
    );

  if (Array.isArray(cfg?.sections)) {
    const sec = pick(cfg.sections);
    if (sec) return sec;
  }
  if (Array.isArray(cfg?.auth?.sections)) {
    const groups = cfg.auth.sections;
    const flat = groups.flat();
    const sec = pick(flat);
    if (sec) return sec;
  }
  return undefined;
};
// ---------------------------------------------

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
          {connector?.icon ? (
            <img
              className={authStep.error ? undefined : "animate-pulse"}
              src={connector.icon}
              alt={connector.name}
              height={28}
              width={28}
            />
          ) : (
            (() => {
              const IconComponent = getWalletIcon(connector.name);
              return IconComponent ? (
                <IconComponent
                  className={`w-[28px] h-[28px] ${authStep.error ? undefined : "animate-pulse"}`}
                  width={28}
                  height={28}
                />
              ) : (
                <div style={{ width: 28, height: 28 }} />
              );
            })()
          )}
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
    const errorMessage = getErrorMessage(authStep.error, "WalletConnect");

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
  const { walletConnectParams } = useWalletConnectAuthConfig();
  const { uniqueConnectors, filteredSolanaWallets } = useWalletAvailability();

  // Pull the external_wallets section (wallet list + chainType)
  const uiConfig = useUiConfig();
  const externalSection = useMemo(
    () => getExternalWalletsSection(uiConfig),
    [uiConfig],
  );

  const preferredWalletNames = useMemo<string[]>(
    () => externalSection?.wallets ?? [],
    [externalSection],
  );

  // Chains allowed by config (default to both); keep EVM before SVM for join
  const allowedChains = useMemo<string[]>(
    () =>
      Array.isArray(externalSection?.chainType) &&
      (externalSection!.chainType as string[]).length > 0
        ? (externalSection!.chainType as string[])
        : ["evm", "svm"],
    [externalSection],
  );

  const orderedChains = useMemo(
    () => orderChains(allowedChains),
    [allowedChains],
  );

  // Build the ordered, joined list of wallet buttons:
  const buttons = useMemo(() => {
    const out: JSX.Element[] = [];
    const counted = new Set<string>();

    const allNamesInEnv: string[] = [];

    // Respect chain filter when discovering names
    if (allowedChains.includes("evm")) {
      uniqueConnectors.forEach((c) => {
        const n = norm(c.name);
        if (!allNamesInEnv.includes(n)) allNamesInEnv.push(n);
      });
      // WalletConnect is EVM-only
      if (walletConnectParams) {
        allNamesInEnv.push("wallet_connect");
      }
    }

    if (allowedChains.includes("svm")) {
      filteredSolanaWallets.forEach((w) => {
        const n = norm(w.adapter.name);
        if (!allNamesInEnv.includes(n)) allNamesInEnv.push(n);
      });
    }

    const pushByName = (nameRaw: string) => {
      const n = norm(nameRaw);
      if (counted.has(n)) return;

      // WalletConnect (EVM-only)
      if (isWC(n)) {
        if (walletConnectParams && allowedChains.includes("evm")) {
          out.push(<WalletConnectButton key="walletconnect" />);
          counted.add(n);
        }
        return;
      }

      const elems: JSX.Element[] = [];
      for (const chain of orderedChains) {
        if (chain === "evm") {
          const conn = uniqueConnectors.find((c) => norm(c.name) === n);
          if (conn)
            elems.push(
              <WalletButton key={`${conn.name}-evm`} connector={conn} />,
            );
        } else if (chain === "svm") {
          const sol = filteredSolanaWallets.find(
            (w) => norm(w.adapter.name) === n,
          );
          if (sol)
            elems.push(
              <SolanaWalletButton
                key={`${sol.adapter.name}-svm`}
                wallet={sol}
              />,
            );
        }
      }

      if (elems.length) {
        out.push(...elems); // join both if available under allowed chains
        counted.add(n);
      }
    };

    // 1) Preferred order from config (no cap)
    for (const name of preferredWalletNames) {
      pushByName(name);
    }

    // 2) Append any remaining wallets not listed in config
    for (const name of allNamesInEnv) {
      if (!counted.has(norm(name))) pushByName(name);
    }

    return out;
  }, [
    preferredWalletNames,
    orderedChains,
    uniqueConnectors,
    filteredSolanaWallets,
    walletConnectParams,
    allowedChains,
  ]);

  const hasAnyVisibleWallets = useMemo(() => {
    const evmVisible =
      allowedChains.includes("evm") &&
      (uniqueConnectors.length > 0 || !!walletConnectParams);
    const svmVisible =
      allowedChains.includes("svm") && filteredSolanaWallets.length > 0;
    return evmVisible || svmVisible;
  }, [
    allowedChains,
    uniqueConnectors,
    filteredSolanaWallets,
    walletConnectParams,
  ]);

  return (
    <CardContent
      className="w-full"
      header="Select your wallet"
      description={
        hasAnyVisibleWallets ? (
          <div className="flex flex-col gap-3 w-full">{buttons}</div>
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
