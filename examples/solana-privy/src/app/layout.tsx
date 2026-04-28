"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;

const SOLANA_DEVNET_RPC = `https://solana-devnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;
const SOLANA_DEVNET_WS = `wss://solana-devnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;
const SOLANA_MAINNET_RPC = `https://solana-mainnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;
const SOLANA_MAINNET_WS = `wss://solana-mainnet.g.alchemypreview.com/v2/${ALCHEMY_API_KEY}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
