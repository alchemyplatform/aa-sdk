"use client";

/**
 * Universal Account Demo Component
 *
 * This component demonstrates how to use Universal Accounts with Alchemy Account Kit.
 * It shows:
 * 1. Initializing a Universal Account with an EOA owner
 * 2. Fetching unified balance across all chains
 * 3. Sending a cross-chain transaction (minting an NFT)
 */

import { useState } from "react";
import {
  // Core hooks from @account-kit/universal-account
  useUniversalAccount, // Initialize UA with owner address
  useUnifiedBalance, // Get aggregated balance across chains
  useSendTransaction, // Send transactions (transfer, buy, sell, etc.)
  CHAIN_ID, // Chain ID constants for supported chains
} from "@account-kit/universal-account";
import { useSigner } from "@account-kit/react";
import { type Address, encodeFunctionData, toBytes } from "viem";

// =============================================================================
// EXAMPLE: NFT Contract on Avalanche
// =============================================================================
// This is a free mint NFT contract for demo purposes.
// Replace with your own contract address and ABI for your use case.
const NFT_CONTRACT = "0xdea7bF60E53CD578e3526F36eC431795f7EEbFe6" as const;

interface UniversalAccountDemoProps {
  /**
   * The EOA (Externally Owned Account) address that controls the Universal Account.
   *
   * WHERE TO GET THIS:
   * In your parent component, use Alchemy's useUser() hook:
   *
   * ```tsx
   * import { useUser } from "@account-kit/react";
   *
   * const user = useUser();
   * const eoaAddress = user?.address; // ← Pass this as the prop
   * ```
   *
   * See app/page.tsx for the full example.
   */
  eoaAddress: Address;
}

export function UniversalAccountDemo({
  eoaAddress,
}: UniversalAccountDemoProps) {
  // ==========================================================================
  // STEP 1: Get the Alchemy signer for transaction signing
  // ==========================================================================
  // The signer is used to sign Universal Account transactions.
  // It comes from Alchemy Account Kit's authentication.
  const signer = useSigner();

  // Local state for transaction feedback
  const [txResult, setTxResult] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // ==========================================================================
  // STEP 2: Initialize Universal Account
  // ==========================================================================
  // Pass the EOA address to create/connect to the Universal Account.
  // This automatically derives the UA's EVM and Solana addresses.
  const { address, solanaAddress, isReady, isInitializing, error } =
    useUniversalAccount(eoaAddress);

  // ==========================================================================
  // STEP 3: Get Unified Balance
  // ==========================================================================
  // Fetches aggregated balance across ALL supported chains.
  // No need to query each chain individually!
  const {
    totalBalanceUSD, // Total balance in USD
    assets, // Array of assets with per-chain breakdown
    isLoading: isLoadingBalance,
    refetch, // Call to refresh balance
  } = useUnifiedBalance();

  // ==========================================================================
  // STEP 4: Setup Transaction Hook
  // ==========================================================================
  // useSendTransaction provides methods for all transaction types:
  // - sendTransfer: Send tokens to any address
  // - sendUniversal: Execute custom contract calls
  // - sendBuy: Buy/swap into a token
  // - sendSell: Sell a token
  // - sendConvert: Convert between primary assets
  const {
    sendUniversal, // We use this for the NFT mint
    // sendTransfer,  // For token transfers
    // sendBuy,       // For buying tokens
    // sendSell,      // For selling tokens
    // sendConvert,   // For converting assets
    // Check Particle docs for more details
    // https://developers.particle.network/universal-accounts/ua-reference/desktop/web#sending-a-transfer-transaction
    isLoading: isSending,
  } = useSendTransaction({
    // This function signs the transaction hash with the Alchemy signer
    signMessage: async (message: string) => {
      if (!signer) throw new Error("Signer not available");
      // IMPORTANT: Sign the raw bytes, not a string message
      // The message is a hex-encoded hash from Universal Account
      return await signer.signMessage({ raw: toBytes(message) });
    },
  });

  // ==========================================================================
  // STEP 5: Example Transaction - Mint NFT on Avalanche
  // ==========================================================================
  // This demonstrates sendUniversal for custom contract interactions.
  // The Universal Account will automatically:
  // - Source funds from any chain where you have balance
  // - Handle bridging and gas payment
  // - Execute the transaction on the target chain
  const handleMintNFT = async () => {
    setTxResult(null);
    setTxError(null);

    try {
      // Encode the contract call data using viem
      const mintData = encodeFunctionData({
        abi: [{ type: "function", name: "mint", inputs: [], outputs: [] }],
        functionName: "mint",
      });

      // Send the transaction using Universal Account
      const result = await sendUniversal({
        // Target chain - use CHAIN_ID constants for type safety
        chainId: CHAIN_ID.AVALANCHE,

        // Tokens needed on the target chain for the transaction
        // Empty array = no tokens needed (free mint)
        // For payable functions: [{ type: "AVAX", amount: "0.1" }]
        expectTokens: [],

        // Array of contract calls to execute
        transactions: [
          {
            to: NFT_CONTRACT,
            data: mintData,
            // value: "0x..." // For payable functions
          },
        ],
      });

      // Transaction submitted! View on UniversalX explorer
      setTxResult(
        `https://universalx.app/activity/details?id=${result.transactionId}`,
      );
    } catch (err) {
      console.error("Mint failed:", err);
      setTxError(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  if (isInitializing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-400 font-medium mb-2">
          Error
        </h3>
        <p className="text-red-600 dark:text-red-300 text-sm">
          {error.message}
        </p>
        <p className="text-red-500 dark:text-red-400 text-xs mt-2">
          Make sure you have set the following environment variables:
        </p>
        <ul className="text-red-500 dark:text-red-400 text-xs mt-1 list-disc list-inside">
          <li>NEXT_PUBLIC_PARTICLE_PROJECT_ID</li>
          <li>NEXT_PUBLIC_PARTICLE_CLIENT_KEY</li>
          <li>NEXT_PUBLIC_PARTICLE_APP_ID</li>
        </ul>
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Universal Account Addresses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Universal Account
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              EVM Address
            </p>
            <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
              {address}
            </p>
          </div>
          {solanaAddress && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Solana Address
              </p>
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {solanaAddress}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Unified Balance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Unified Balance
          </h2>
          <button
            onClick={refetch}
            disabled={isLoadingBalance}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
          >
            {isLoadingBalance ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ${totalBalanceUSD?.toFixed(2) ?? "0.00"}
          </div>

          {assets && assets.length > 0 ? (
            <div className="space-y-2">
              {assets.map((asset) => (
                <div
                  key={asset.tokenType}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {asset.tokenType}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.amount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${asset.amountInUSD.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.chainAggregation.length} chain
                      {asset.chainAggregation.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No assets found. Fund your Universal Account to get started.
            </p>
          )}
        </div>
      </div>

      {/* Mint NFT Demo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mint NFT on Avalanche
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Mint a free NFT on Avalanche using your Universal Account. Gas will be
          paid from any of your available balances.
        </p>

        <button
          onClick={handleMintNFT}
          disabled={isSending || !signer}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSending ? "Minting..." : "Mint NFT"}
        </button>

        {txResult && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-400 text-sm font-medium">
              Transaction Successful!
            </p>
            <a
              href={txResult}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-300 text-sm underline break-all"
            >
              View on UniversalX
            </a>
          </div>
        )}

        {txError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400 text-sm font-medium">
              Transaction Failed
            </p>
            <p className="text-red-600 dark:text-red-300 text-sm">{txError}</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-blue-800 dark:text-blue-400 font-medium mb-2">
          How it works
        </h3>
        <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
          <li>
            • Your Universal Account aggregates balances across all supported
            chains
          </li>
          <li>• Send transactions to any chain without manual bridging</li>
          <li>• Pay gas fees with any supported token</li>
          <li>
            • View your transactions on{" "}
            <a
              href="https://universalx.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 dark:hover:text-blue-200"
            >
              UniversalX
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
