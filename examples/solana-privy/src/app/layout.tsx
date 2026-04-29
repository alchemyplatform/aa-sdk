"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrivyProvider } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;

const SOLANA_DEVNET_RPC = `https://solana-devnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;
const SOLANA_DEVNET_WS = `wss://solana-devnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;
const SOLANA_MAINNET_RPC = `https://solana-mainnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;
const SOLANA_MAINNET_WS = `wss://solana-mainnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;

const NAV_LINKS = [
  { href: "/", label: "Privy" },
  { href: "/wallet-standard", label: "Wallet Standard" },
  { href: "/phantom-raw", label: "Phantom Raw" },
];

function Nav() {
  const pathname = usePathname();
  return (
    <nav
      style={{
        padding: "12px 40px",
        borderBottom: "1px solid #ddd",
        fontFamily: "monospace",
        display: "flex",
        gap: 24,
      }}
    >
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{
            color: pathname === href ? "#000" : "#666",
            fontWeight: pathname === href ? 700 : 400,
            textDecoration: "none",
          }}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            appearance: {
              walletChainType: "solana-only",
            },
            embeddedWallets: {
              createOnLogin: "all-users",
            },
            solana: {
              rpcs: {
                "solana:mainnet": {
                  rpc: createSolanaRpc(SOLANA_MAINNET_RPC),
                  rpcSubscriptions:
                    createSolanaRpcSubscriptions(SOLANA_MAINNET_WS),
                },
                "solana:devnet": {
                  rpc: createSolanaRpc(SOLANA_DEVNET_RPC),
                  rpcSubscriptions:
                    createSolanaRpcSubscriptions(SOLANA_DEVNET_WS),
                },
              },
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
