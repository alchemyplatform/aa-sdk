"use client";

import { useState } from "react";
import {
  useAlchemyPrepareSwap,
  useAlchemySubmitSwap,
  type PrepareSwapResult,
} from "@account-kit/privy-integration";
import { isAddress, formatEther, type Address, type Hex } from "viem";

const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const USDC_ADDRESS_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const WETH_ADDRESS_BASE_SEPOLIA = "0x4200000000000000000000000000000000000006";

export function TokenSwap() {
  const prepareSwap = useAlchemyPrepareSwap();
  const submitSwap = useAlchemySubmitSwap();

  const [fromToken, setFromToken] = useState(ETH_ADDRESS);
  const [toToken, setToToken] = useState(USDC_ADDRESS_BASE_SEPOLIA);
  const [minimumToAmount, setMinimumToAmount] = useState("0.000001");
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

    if (!minimumToAmount || parseFloat(minimumToAmount) <= 0) {
      setValidationError("Minimum amount must be greater than 0");
      return;
    }

    try {
      const amountWei = BigInt(parseFloat(minimumToAmount) * 10 ** 18);
      const result = await prepareSwap.prepareSwap({
        fromToken: fromToken as Address,
        toToken: toToken as Address,
        minimumToAmount: `0x${amountWei.toString(16)}` as Hex,
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
      setMinimumToAmount("0.000001");
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

  return (
    <div className="card">
      <h2>Token Swap</h2>
      <p>Swap tokens with gas sponsorship</p>

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
              disabled={prepareSwap.isLoading}
            />
            <div className="helper-text">
              ETH: {ETH_ADDRESS}
              <br />
              WETH (Base Sepolia): {WETH_ADDRESS_BASE_SEPOLIA}
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
              disabled={prepareSwap.isLoading}
            />
            <div className="helper-text">
              USDC (Base Sepolia): {USDC_ADDRESS_BASE_SEPOLIA}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="minimumToAmount">Minimum Amount to Receive</label>
            <input
              id="minimumToAmount"
              type="number"
              value={minimumToAmount}
              onChange={(e) => setMinimumToAmount(e.target.value)}
              placeholder="0.000001"
              step="0.000001"
              min="0"
              disabled={prepareSwap.isLoading}
            />
            <div className="helper-text">
              Enter the minimum amount you want to receive
            </div>
          </div>

          {validationError && <div className="error">{validationError}</div>}
          {prepareSwap.error && (
            <div className="error">{prepareSwap.error.message}</div>
          )}

          <button
            type="submit"
            className="button"
            disabled={prepareSwap.isLoading}
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
