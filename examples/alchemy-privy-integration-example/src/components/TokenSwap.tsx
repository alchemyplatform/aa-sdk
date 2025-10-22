"use client";

import { useState, useEffect } from "react";
import {
  useAlchemyPrepareSwap,
  useAlchemySubmitSwap,
  useAlchemyClient,
  type PrepareSwapResult,
} from "@account-kit/privy-integration";
import { formatEther, formatUnits, type Address, type Hex } from "viem";
import { useWallets } from "@privy-io/react-auth";
import { base, baseSepolia } from "viem/chains";

const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

/**
 * Get block explorer URL for a transaction hash based on chain ID
 *
 * @param chainId
 * @param txHash
 * @returns
 */
function getExplorerUrl(chainId: number, txHash: string): string {
  const explorers = {
    [base.id]: {
      name: "BaseScan",
      url: base.blockExplorers?.default?.url || "https://basescan.org",
    },
    [baseSepolia.id]: {
      name: "Base Sepolia Explorer",
      url:
        baseSepolia.blockExplorers?.default?.url ||
        "https://sepolia.basescan.org",
    },
  };

  const explorer = explorers[chainId as keyof typeof explorers] || {
    name: "Explorer",
    url: `https://etherscan.io`,
  };
  return `View on ${explorer.name}: ${explorer.url}/tx/${txHash}`;
}

export function TokenSwap({ onSuccess }: { onSuccess?: () => void }) {
  const { wallets } = useWallets();
  const { getClient } = useAlchemyClient();
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

  // Allow flipping between USDC → ETH and ETH → USDC
  const [fromToken, setFromToken] = useState(USDC_ADDRESS_BASE);
  const [toToken, setToToken] = useState(ETH_ADDRESS);
  const [swapAmount, setSwapAmount] = useState("1");

  const isSwappingFromUsdc = fromToken === USDC_ADDRESS_BASE;
  const fromDecimals = isSwappingFromUsdc ? 6 : 18;
  const fromSymbol = isSwappingFromUsdc ? "USDC" : "ETH";
  const toSymbol = isSwappingFromUsdc ? "ETH" : "USDC";
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [preparedSwap, setPreparedSwap] = useState<PrepareSwapResult | null>(
    null,
  );

  const flipSwapDirection = () => {
    // Swap the from and to tokens
    const tempFrom = fromToken;
    setFromToken(toToken);
    setToToken(tempFrom);
    // Reset swap amount to default
    setSwapAmount(toToken === USDC_ADDRESS_BASE ? "1" : "0.001");
    // Clear any previous quote
    setPreparedSwap(null);
    setValidationError("");
    setSuccessMessage("");
    prepareSwap.reset();
  };

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
      // Use correct decimals based on source token
      const amountInSmallestUnit = BigInt(
        parseFloat(swapAmount) * 10 ** fromDecimals,
      );

      // Get the account address to use for the swap
      // This ensures we use the correct address for both eip7702 and owner modes
      const { account } = await getClient();

      const result = await prepareSwap.prepareSwap({
        from: account.address as Address,
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
      const result = await submitSwap.submitSwap(preparedSwap);
      const explorerMessage = currentChain
        ? getExplorerUrl(currentChain, result.txnHash)
        : `Swap successful! Transaction: ${result.txnHash}`;
      setSuccessMessage(explorerMessage);

      // Reset form
      setPreparedSwap(null);
      setSwapAmount(isSwappingFromUsdc ? "1" : "0.001");
      prepareSwap.reset();
      submitSwap.reset();

      // Trigger balance refresh
      if (onSuccess) {
        onSuccess();
      }
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <label>Swap Direction</label>
              <button
                type="button"
                onClick={flipSwapDirection}
                className="button button-secondary"
                style={{
                  width: "auto",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.875rem",
                }}
                disabled={prepareSwap.isLoading || isDisabled}
              >
                ⇄ Flip
              </button>
            </div>
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            >
              <strong>{fromSymbol}</strong> → <strong>{toSymbol}</strong>
              <div className="helper-text" style={{ marginTop: "0.5rem" }}>
                Swapping {fromSymbol} ({fromDecimals} decimals) for {toSymbol}{" "}
                on Base
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="swapAmount">Amount to Swap ({fromSymbol})</label>
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
              Enter {fromSymbol} amount (e.g.,{" "}
              {isSwappingFromUsdc ? "1 = 1 USDC" : "0.001 = 0.001 ETH"})
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
                {isSwappingFromUsdc
                  ? `${formatUnits(BigInt(preparedSwap.quote.fromAmount), 6)} USDC`
                  : `${formatEther(BigInt(preparedSwap.quote.fromAmount))} ETH`}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">You&apos;ll Receive (min):</span>
              <span className="info-value">
                {isSwappingFromUsdc
                  ? `${formatEther(BigInt(preparedSwap.quote.minimumToAmount))} ETH`
                  : `${formatUnits(BigInt(preparedSwap.quote.minimumToAmount), 6)} USDC`}
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
