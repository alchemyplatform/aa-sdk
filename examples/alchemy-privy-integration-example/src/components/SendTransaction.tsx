"use client";

import { useState } from "react";
import { useAlchemySendTransaction } from "@account-kit/privy-integration";
import { parseEther, isAddress, type Address } from "viem";

export function SendTransaction() {
  const { sendTransaction, isLoading, error } = useAlchemySendTransaction();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

      setSuccessMessage(`Transaction sent! Hash: ${result.txnHash}`);
      setRecipient("");
      setAmount("0.001");
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
