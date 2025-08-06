"use client";

import { useWallet, type Wallet } from "@solana/wallet-adapter-react";
import { useAuthContext } from "../context.js";
import { useCallback, useEffect } from "react";

export const useConnectSolanaEOA = () => {
  const { setAuthStep, authStep } = useAuthContext();
  const { disconnect, select, publicKey } = useWallet();

  const connect = useCallback(
    (wallet: Wallet) => {
      disconnect().then(async () => {
        select(wallet.adapter.name);
        setAuthStep({ type: "eoa_connect", chain: "svm", wallet });
      });
    },
    [select, setAuthStep, disconnect],
  );

  useEffect(() => {
    if (!publicKey) return;

    if (authStep.type !== "complete") setAuthStep({ type: "complete" });
  }, [publicKey, setAuthStep, authStep.type]);

  return {
    connect,
  };
};
