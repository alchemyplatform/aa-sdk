"use client";

// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { useMemo, type ReactNode } from "react";
import { useSolanaAdapters } from "./hooks/useSolanaAdapters.js";

export function AlchemySolanaAccountContext(props: { children: ReactNode }) {
  // const network = WalletAdapterNetwork.Devnet;
  const configuredAdapters = useSolanaAdapters();

  const wallets = useMemo(() => configuredAdapters, [configuredAdapters]);

  return (
    <WalletProvider wallets={wallets} autoConnect>
      {props.children}
    </WalletProvider>
  );
}
