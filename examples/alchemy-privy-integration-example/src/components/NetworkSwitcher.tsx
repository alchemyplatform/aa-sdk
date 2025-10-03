"use client";

import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { base, baseSepolia } from "viem/chains";

export function NetworkSwitcher() {
  const { wallets } = useWallets();
  const [currentChain, setCurrentChain] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState("");

  // Sync with wallet's current chain
  useEffect(() => {
    const wallet = wallets.find((w) => w.walletClientType === "privy");
    if (!wallet) return;

    const chainIdStr = wallet.chainId?.toString();
    const chainId = chainIdStr?.includes(":")
      ? Number(chainIdStr.split(":")[1])
      : Number(chainIdStr);

    if (currentChain !== chainId) {
      setCurrentChain(chainId);
    }
  }, [wallets, currentChain]);

  const handleSwitch = async (chainId: number) => {
    const wallet = wallets.find((w) => w.walletClientType === "privy");
    if (!wallet) {
      setError("No wallet found");
      return;
    }

    setIsSwitching(true);
    setError("");

    try {
      await wallet.switchChain(chainId);
      setCurrentChain(chainId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch chain");
    } finally {
      setIsSwitching(false);
    }
  };

  const getChainName = (chainId: number | null) => {
    if (chainId === base.id) return "Base";
    if (chainId === baseSepolia.id) return "Base Sepolia";
    return "Unknown";
  };

  return (
    <div className="card">
      <h2>Network</h2>
      <p>Current: {getChainName(currentChain)}</p>

      {error && (
        <div className="error" style={{ marginTop: "0.5rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button
          onClick={() => handleSwitch(baseSepolia.id)}
          disabled={isSwitching || currentChain === baseSepolia.id}
          className="button button-secondary"
          style={{ flex: 1 }}
        >
          {currentChain === baseSepolia.id ? "✓ " : ""}Base Sepolia
        </button>
        <button
          onClick={() => handleSwitch(base.id)}
          disabled={isSwitching || currentChain === base.id}
          className="button"
          style={{ flex: 1 }}
        >
          {currentChain === base.id ? "✓ " : ""}Base
        </button>
      </div>
    </div>
  );
}
