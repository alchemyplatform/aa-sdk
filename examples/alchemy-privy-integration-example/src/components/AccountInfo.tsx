"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, useCallback } from "react";
import {
  createPublicClient,
  http,
  formatEther,
  formatUnits,
  type Address,
} from "viem";
import { base, baseSepolia } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";
import {
  useAlchemyClient,
  useAlchemyConfig,
} from "@account-kit/privy-integration";

const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_ADDRESS_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const;

export function AccountInfo({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { getClient } = useAlchemyClient();
  const config = useAlchemyConfig();
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChain, setCurrentChain] = useState<number | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null,
  );

  // Detect current chain
  useEffect(() => {
    const wallet = wallets.find((w) => w.walletClientType === "privy");
    if (!wallet) return;

    const chainIdStr = wallet.chainId?.toString();
    const chainId = chainIdStr?.includes(":")
      ? Number(chainIdStr.split(":")[1])
      : Number(chainIdStr);

    setCurrentChain(chainId);
  }, [wallets]);

  const fetchBalances = useCallback(async () => {
    if (!user?.wallet?.address || currentChain === null) {
      setEthBalance(null);
      setUsdcBalance(null);
      setSmartAccountAddress(null);
      return;
    }

    setIsLoading(true);
    try {
      const chain = currentChain === base.id ? base : baseSepolia;
      const usdcAddress =
        currentChain === base.id
          ? USDC_ADDRESS_BASE
          : USDC_ADDRESS_BASE_SEPOLIA;

      const publicClient = createPublicClient({
        chain,
        transport: http(),
      });

      const { account } = await getClient();
      setSmartAccountAddress(account.address);

      // Fetch ETH balance (from smart account in owner mode, from signer in eip7702 mode)
      const balanceWei = await publicClient.getBalance({
        address: account.address,
      });
      setEthBalance(formatEther(balanceWei));

      // Fetch USDC balance (from smart account in owner mode, from signer in eip7702 mode)
      try {
        const usdcBalanceWei = await publicClient.readContract({
          address: usdcAddress as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [account.address],
        });
        setUsdcBalance(formatUnits(usdcBalanceWei as bigint, 6));
      } catch (error) {
        console.error("Failed to fetch USDC balance:", error);
        setUsdcBalance("0");
      }
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setEthBalance("Error");
      setUsdcBalance("Error");
    } finally {
      setIsLoading(false);
    }
  }, [user?.wallet?.address, currentChain, getClient]);

  // Fetch balances when wallet, chain, or refreshTrigger changes
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances, refreshTrigger]);

  const chainName =
    currentChain === base.id
      ? "Base"
      : currentChain === baseSepolia.id
        ? "Base Sepolia"
        : "Unknown";

  return (
    <div className="card">
      <h2>Account Information</h2>
      <div>
        <div className="info-row">
          <span className="info-label">Email:</span>
          <span className="info-value">{user?.email?.address || "N/A"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Signer Address:</span>
          <span className="info-value" style={{ fontSize: "0.85em" }}>
            {user?.wallet?.address || "—"}
          </span>
        </div>
        {config.accountAuthMode === "owner" && (
          <div className="info-row">
            <span className="info-label">Smart Account:</span>
            <span className="info-value" style={{ fontSize: "0.85em" }}>
              {isLoading ? "Loading..." : smartAccountAddress || "—"}
            </span>
          </div>
        )}
        <div className="info-row">
          <span className="info-label">Network:</span>
          <span className="info-value">{chainName}</span>
        </div>
        <div className="info-row">
          <span className="info-label">
            ETH Balance
            {config.accountAuthMode === "owner"
              ? " (Smart Account)"
              : " (Signer)"}
            :
          </span>
          <span className="info-value">
            {isLoading
              ? "Loading..."
              : ethBalance
                ? `${parseFloat(ethBalance).toFixed(6)} ETH`
                : "—"}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">
            USDC Balance
            {config.accountAuthMode === "owner"
              ? " (Smart Account)"
              : " (Signer)"}
            :
          </span>
          <span className="info-value">
            {isLoading
              ? "Loading..."
              : usdcBalance
                ? `${parseFloat(usdcBalance).toFixed(2)} USDC`
                : "—"}
          </span>
        </div>
      </div>
      <button
        onClick={logout}
        className="button button-danger"
        style={{ marginTop: "1rem" }}
      >
        Logout
      </button>
    </div>
  );
}
