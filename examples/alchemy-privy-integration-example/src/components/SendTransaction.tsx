"use client";

import { useState, useEffect } from "react";
import { useAlchemySendTransaction } from "@account-kit/privy-integration";
import { parseEther, isAddress, type Address } from "viem";
import { useWallets } from "@privy-io/react-auth";
import { base, baseSepolia } from "viem/chains";

/**
 * Get block explorer URL for a transaction hash based on chain ID
 *
 * @param chainId
 * @param txHash
 * @returns
 */
function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers: Record<number, { name: string; url: string }> = {
    [base.id]: { name: "BaseScan", url: "https://basescan.org" },
    [baseSepolia.id]: {
      name: "Base Sepolia Explorer",
      url: "https://sepolia.basescan.org",
    },
  };

  const explorer = explorers[chainId] || {
    name: "Explorer",
    url: `https://etherscan.io`,
  };
  return `View on ${explorer.name}: ${explorer.url}/tx/${txHash}`;
}

export function SendTransaction({ onSuccess }: { onSuccess?: () => void }) {
  const { sendTransaction, isLoading, error } = useAlchemySendTransaction();
  const { wallets } = useWallets();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentChain, setCurrentChain] = useState<number | null>(null);

  // Sync with wallet's current chain
  useEffect(() => {
    const wallet = wallets.find((w) => w.walletClientType === "privy");
    if (!wallet) return;

    const chainIdStr = wallet.chainId?.toString();
    const chainId = chainIdStr?.includes(":")
      ? Number(chainIdStr.split(":")[1])
      : Number(chainIdStr);

    setCurrentChain(chainId);
  }, [wallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    // Validation
    if (!recipient) {
      setValidationError("Recipient address is required");
      return;
    }

    if (!isAddress(recipient)) {
      setValidationError("Invalid Ethereum address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setValidationError("Amount must be greater than 0");
      return;
    }

    try {
      const result = await sendTransaction({
        to: recipient as Address,
        value: parseEther(amount),
        data: "0x",
      });

      const explorerMessage = currentChain
        ? getExplorerUrl(currentChain, result.txnHash)
        : `Transaction sent! Hash: ${result.txnHash}`;
      setSuccessMessage(explorerMessage);
      setRecipient("");
      setAmount("0.001");

      // Trigger balance refresh
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Transaction failed",
      );
    }
  };

  return (
    <div className="card">
      <h2>Send Transaction</h2>
      <p>Transfer ETH to another address with gas sponsorship</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (ETH)</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
            step="0.001"
            min="0"
            disabled={isLoading}
          />
        </div>

        {validationError && <div className="error">{validationError}</div>}
        {error && <div className="error">{error.message}</div>}
        {successMessage && <div className="success">{successMessage}</div>}

        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="loading"></span>
              Sending...
            </>
          ) : (
            "Send Transaction"
          )}
        </button>
      </form>
    </div>
  );
}
