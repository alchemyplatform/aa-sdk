"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { AccountInfo } from "@/components/AccountInfo";
import { SendTransaction } from "@/components/SendTransaction";
import { TokenSwap } from "@/components/TokenSwap";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { SolanaTransactionCard } from "@/components/SolanaTransactionCard";

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(0);

  const refreshBalances = () => {
    setBalanceRefreshTrigger((prev) => prev + 1);
  };

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className="center-screen">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    return (
      <div className="center-screen">
        <div className="card login-card">
          <h1 style={{ marginBottom: "1rem" }}>Alchemy + Privy Integration</h1>
          <p style={{ marginBottom: "1.5rem" }}>
            Connect your wallet to get started with gas-sponsored transactions
          </p>
          <button onClick={login} className="button">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Main app view when authenticated
  return (
    <main className="container">
      <div className="header">
        <h1>Alchemy + Privy Integration Example</h1>
        <p style={{ color: "#666" }}>
          Demonstrating gas sponsorship and token swaps with owner auth mode
        </p>
      </div>

      <div className="grid grid-cols-2">
        {/* Left column - Account info */}
        <div>
          <AccountInfo refreshTrigger={balanceRefreshTrigger} />
          <NetworkSwitcher onNetworkChange={refreshBalances} />
        </div>

        {/* Right column - Transaction examples */}
        <div>
          <SendTransaction onSuccess={refreshBalances} />
          <TokenSwap onSuccess={refreshBalances} />
          <SolanaTransactionCard />
        </div>
      </div>
    </main>
  );
}
