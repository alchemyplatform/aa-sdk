"use client";

import { useState, useEffect } from "react";
import {
  useAlchemyPrepareSwap,
  useAlchemySubmitSwap,
  type PrepareSwapResult,
} from "@account-kit/privy-integration";
import { formatEther, formatUnits, type Address, type Hex } from "viem";
import { useWallets } from "@privy-io/react-auth";
import { base } from "viem/chains";

const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export function TokenSwap() {
  const { wallets } = useWallets();
  const prepareSwap = useAlchemyPrepareSwap();
  const submitSwap = useAlchemySubmitSwap();

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

  // Hard-coded to USDC → ETH for simplicity
  const fromToken = USDC_ADDRESS_BASE;
  const toToken = ETH_ADDRESS;
  const [swapAmount, setSwapAmount] = useState("1");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [preparedSwap, setPreparedSwap] = useState<PrepareSwapResult | null>(
    null,
  );

  const handlePrepare = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    // Validation
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setValidationError("Swap amount must be greater than 0");
      return;
    }

    try {
      // USDC uses 6 decimals
      const amountInSmallestUnit = BigInt(parseFloat(swapAmount) * 10 ** 6);

      const result = await prepareSwap.prepareSwap({
        from: wallets[0].address as Address,
        fromToken: fromToken as Address,
        toToken: toToken as Address,
        fromAmount: `0x${amountInSmallestUnit.toString(16)}` as Hex,
      });

      setPreparedSwap(result);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Failed to prepare swap",
      );
    }
  };

  const handleExecute = async () => {
    if (!preparedSwap) return;

    setValidationError("");
    setSuccessMessage("");

    try {
      const result = await submitSwap.submitSwap(preparedSwap.preparedCalls);
      setSuccessMessage(`Swap successful! Transaction: ${result.txnHash}`);

      // Reset form
      setPreparedSwap(null);
      setSwapAmount("1");
      prepareSwap.reset();
      submitSwap.reset();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Swap failed");
    }
  };

  const handleCancel = () => {
    setPreparedSwap(null);
    setValidationError("");
    setSuccessMessage("");
    prepareSwap.reset();
    submitSwap.reset();
  };

  const isOnBaseMainnet = currentChain === base.id;
  const isDisabled = !isOnBaseMainnet;

  return (
    <div className="card">
      <h2>Token Swap</h2>
      <p>Swap tokens with gas sponsorship</p>

      {!isOnBaseMainnet && (
        <div
          className="error"
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            backgroundColor: "#fff3cd",
            color: "#856404",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
        >
          ⚠️ Swaps only work on Base mainnet. Please switch networks above.
        </div>
      )}

      {!preparedSwap ? (
        <form onSubmit={handlePrepare}>
          <div className="form-group">
            <label>Swap Direction</label>
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            >
              <strong>USDC</strong> → <strong>ETH</strong>
              <div className="helper-text" style={{ marginTop: "0.5rem" }}>
                Swapping USDC (6 decimals) for ETH (18 decimals) on Base
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="swapAmount">Amount to Swap (USDC)</label>
            <input
              id="swapAmount"
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="1.0"
              step="any"
              min="0"
              disabled={prepareSwap.isLoading || isDisabled}
            />
            <div className="helper-text">
              Enter USDC amount (e.g., 1 = 1 USDC, 0.5 = 0.5 USDC)
            </div>
          </div>

          {validationError && <div className="error">{validationError}</div>}
          {prepareSwap.error && (
            <div className="error">{prepareSwap.error.message}</div>
          )}

          <button
            type="submit"
            className="button"
            disabled={prepareSwap.isLoading || isDisabled}
          >
            {prepareSwap.isLoading ? (
              <>
                <span className="loading"></span>
                Getting Quote...
              </>
            ) : (
              "Get Swap Quote"
            )}
          </button>
        </form>
      ) : (
        <div>
          <div className="quote-details">
            <div className="info-row">
              <span className="info-label">Swapping:</span>
              <span className="info-value">
                {formatUnits(BigInt(preparedSwap.quote.fromAmount), 6)} USDC
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">You&apos;ll Receive (min):</span>
              <span className="info-value">
                {formatEther(BigInt(preparedSwap.quote.minimumToAmount))} ETH
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Quote Expires:</span>
              <span className="info-value">
                {new Date(
                  parseInt(preparedSwap.quote.expiry, 16) * 1000,
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {validationError && <div className="error">{validationError}</div>}
          {submitSwap.error && (
            <div className="error">{submitSwap.error.message}</div>
          )}
          {successMessage && <div className="success">{successMessage}</div>}

          <div className="button-group">
            <button
              onClick={handleExecute}
              className="button"
              disabled={submitSwap.isLoading}
            >
              {submitSwap.isLoading ? (
                <>
                  <span className="loading"></span>
                  Executing...
                </>
              ) : (
                "Confirm Swap"
              )}
            </button>
            <button
              onClick={handleCancel}
              className="button button-secondary"
              disabled={submitSwap.isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
