"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { createPublicClient, http, formatEther, type Address } from "viem";
import { baseSepolia } from "viem/chains";

export function AccountInfo() {
  const { user, logout } = usePrivy();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.wallet?.address) {
        setBalance(null);
        return;
      }

      setIsLoading(true);
      try {
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });

        const balanceWei = await publicClient.getBalance({
          address: user.wallet.address as Address,
        });

        setBalance(formatEther(balanceWei));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance("Error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [user?.wallet?.address]);

  return (
    <div className="card">
      <h2>Account Information</h2>
      <div>
        <div className="info-row">
          <span className="info-label">Email:</span>
          <span className="info-value">{user?.email?.address || "N/A"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Wallet:</span>
          <span className="info-value">{user?.wallet?.address}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Balance:</span>
          <span className="info-value">
            {isLoading
              ? "Loading..."
              : balance
                ? `${parseFloat(balance).toFixed(6)} ETH`
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
