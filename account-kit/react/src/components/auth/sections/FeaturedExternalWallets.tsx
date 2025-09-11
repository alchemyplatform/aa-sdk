import React, { useMemo } from "react";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet.js";
import { useDeduplicatedConnectors } from "../../../hooks/internal/useWalletDeduplication.js";
import {
  WalletButton,
  SolanaWalletButton,
  WalletConnectButton,
} from "../wallet-buttons/index.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import type { AuthType } from "../types.js";
import type { ChainType } from "../../../configForExternalWallets.js";

interface InlineWalletButtonsProps {
  config: Extract<AuthType, { type: "external_wallets" }>;
}

const orderChains = (chains: ChainType[]) =>
  [...chains].sort((a, b) =>
    a === "evm" && b === "svm" ? -1 : a === "svm" && b === "evm" ? 1 : 0,
  );

const norm = (s: string) => s.toLowerCase();

export const FeaturedExternalWallets = ({
  config,
}: InlineWalletButtonsProps) => {
  const { wallets } = useSolanaWallet(); // Solana adapters
  const connectors = useDeduplicatedConnectors(); // EVM connectors
  const { walletConnectParams } = useWalletConnectAuthConfig();

  const limit = config.numFeaturedWallets ?? Infinity;

  const orderedChains = useMemo<ChainType[]>(
    () => orderChains((config.chainType ?? ["evm", "svm"]) as ChainType[]),
    [config.chainType],
  );

  // Render both chains (if present) for each wallet name, but count the name once.
  const buttons = useMemo(() => {
    const names = config.wallets ?? [];
    const out: React.ReactNode[] = [];
    let counted = 0;

    for (const nameRaw of names) {
      if (counted >= limit) break;

      const name = norm(nameRaw);
      const elems: React.ReactNode[] = [];

      // Handle all wallets including WalletConnect
      for (const chain of orderedChains) {
        if (chain === "evm") {
          // Special case for WalletConnect (EVM only)
          if (name === "wallet_connect" || name === "wallet connect") {
            if (walletConnectParams) {
              elems.push(
                <WalletConnectButton key={`${nameRaw}-walletconnect`} />,
              );
            }
          } else {
            // Regular EVM wallets
            const connector = connectors.find((c) => norm(c.name) === name);
            if (connector) {
              elems.push(
                <WalletButton key={`${nameRaw}-evm`} connector={connector} />,
              );
            }
          }
        } else if (chain === "svm") {
          // Solana wallets only (WalletConnect is not supported on Solana)
          if (!(name === "wallet_connect" || name === "wallet connect")) {
            const wallet = wallets.find((w) => norm(w.adapter.name) === name);
            if (wallet) {
              elems.push(
                <SolanaWalletButton key={`${nameRaw}-svm`} wallet={wallet} />,
              );
            }
          }
        }
      }

      if (elems.length > 0) {
        out.push(...elems); // show both EVM + SVM if available
        counted += 1; // but only count this wallet name once
      }
    }

    return out;
  }, [
    config.wallets,
    orderedChains,
    connectors,
    wallets,
    limit,
    walletConnectParams,
  ]);

  return <>{buttons}</>;
};
