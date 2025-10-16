"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useCreateWallet } from "@privy-io/react-auth/solana";
import { AccountInfo } from "@/components/AccountInfo";
import { SendTransaction } from "@/components/SendTransaction";
import { TokenSwap } from "@/components/TokenSwap";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { useAlchemySolanaTransaction } from "@account-kit/privy-integration";

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
          Demonstrating gas sponsorship and token swaps with EIP-7702 delegation
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

function SolanaTransactionCard() {
  const [toAddress, setToAddress] = useState(
    "EsLn7Zs91QvaZxoiR8udACnc2SbMbG42wJKUnFhTJfyu",
  );
  const [lamports, setLamports] = useState("0");
  const { ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();

  const { sendTransactionAsync, isPending, error, data, reset } =
    useAlchemySolanaTransaction();

  const solanaWallet = wallets[0];

  const onSend = async () => {
    try {
      if (!toAddress.trim()) {
        throw new Error("Please enter a recipient address");
      }
      const amount = Number(lamports || "0");
      if (isNaN(amount) || amount < 0) {
        throw new Error("Invalid lamports amount");
      }
      await sendTransactionAsync({
        transfer: {
          amount,
          toAddress: toAddress.trim(),
        },
      });
    } catch (e) {
      // handled via error state
    }
  };
  console.log(solanaWallet);
  if (!privyReady || !walletsReady) {
    console.log(solanaWallet);
    return (
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Send Solana Transaction</h3>
        <p style={{ color: "#666" }}>Loading wallets...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ marginBottom: "0.75rem" }}>Send Solana Transaction</h3>
      <p style={{ color: "#666", marginBottom: "0.75rem" }}>
        Test the Privy + Alchemy Solana hook. For sponsorship, use an Alchemy
        Solana RPC URL and a valid Policy ID.
      </p>

      {!solanaWallet && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            background: "#fff3cd",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", color: "#856404" }}>
            No Solana wallet found. Create one to send transactions.
          </p>
          <button onClick={() => createWallet()} className="button">
            Create Solana Wallet
          </button>
        </div>
      )}

      {solanaWallet && (
        <p
          style={{
            color: "#28a745",
            marginBottom: "0.75rem",
            fontSize: "0.9em",
          }}
        >
          ✓ Solana Wallet: {solanaWallet.address?.slice(0, 8)}...
          {solanaWallet.address?.slice(-6)}
        </p>
      )}

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <input
          placeholder="Recipient address (base58)"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="input"
        />
        <input
          placeholder="Lamports"
          value={lamports}
          onChange={(e) => setLamports(e.target.value)}
          className="input"
        />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button onClick={onSend} className="button" disabled={isPending}>
          {isPending ? "Sending..." : "Send"}
        </button>
        <button onClick={reset} className="button" disabled={isPending}>
          Reset
        </button>
      </div>

      {data?.hash && (
        <p style={{ marginTop: "0.5rem", wordBreak: "break-all" }}>
          Sent! Tx: {data.hash}
        </p>
      )}
      {error && (
        <p style={{ marginTop: "0.5rem", color: "#c00" }}>{error.message}</p>
      )}
    </div>
  );
}
