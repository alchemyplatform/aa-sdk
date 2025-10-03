"use client";

import { useState, useEffect } from "react";
import {
  useAlchemyPrepareSwap,
  useAlchemySubmitSwap,
  type PrepareSwapResult,
} from "@account-kit/privy-integration";
import { isAddress, formatEther, type Address, type Hex } from "viem";
import { useWallets } from "@privy-io/react-auth";
import { base } from "viem/chains";

const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const WETH_ADDRESS_BASE = "0x4200000000000000000000000000000000000006";

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

  const [fromToken, setFromToken] = useState(ETH_ADDRESS);
  const [toToken, setToToken] = useState(USDC_ADDRESS_BASE);
  const [swapAmount, setSwapAmount] = useState("0.001");
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
    if (!fromToken || !isAddress(fromToken)) {
      setValidationError("Invalid from token address");
      return;
    }

    if (!toToken || !isAddress(toToken)) {
      setValidationError("Invalid to token address");
      return;
    }

    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      setValidationError("Swap amount must be greater than 0");
      return;
    }

    try {
      const amountWei = BigInt(parseFloat(swapAmount) * 10 ** 18);
      const result = await prepareSwap.prepareSwap({
        fromToken: fromToken as Address,
        toToken: toToken as Address,
        fromAmount: `0x${amountWei.toString(16)}` as Hex,
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
      setSwapAmount("0.001");
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
            <label htmlFor="fromToken">From Token</label>
            <input
              id="fromToken"
              type="text"
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              placeholder="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              className="mono"
              disabled={prepareSwap.isLoading || isDisabled}
            />
            <div className="helper-text">
              ETH: {ETH_ADDRESS}
              <br />
              WETH (Base): {WETH_ADDRESS_BASE}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="toToken">To Token</label>
            <input
              id="toToken"
              type="text"
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              placeholder="0x..."
              className="mono"
              disabled={prepareSwap.isLoading || isDisabled}
            />
            <div className="helper-text">USDC (Base): {USDC_ADDRESS_BASE}</div>
          </div>

          <div className="form-group">
            <label htmlFor="swapAmount">Amount to Swap</label>
            <input
              id="swapAmount"
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              placeholder="0.001"
              step="any"
              min="0"
              disabled={prepareSwap.isLoading || isDisabled}
            />
            <div className="helper-text">
              Enter the exact amount you want to swap from the source token
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
              <span className="info-label">From Amount:</span>
              <span className="info-value">
                {formatEther(BigInt(preparedSwap.quote.fromAmount))} tokens
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Minimum You&apos;ll Receive:</span>
              <span className="info-value">
                {formatEther(BigInt(preparedSwap.quote.minimumToAmount))} tokens
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Expires:</span>
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
