"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { AlchemyProvider } from "@account-kit/privy-integration";
import { baseSepolia } from "viem/chains";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const policyId = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
  const solanaPolicyId = process.env.NEXT_PUBLIC_ALCHEMY_SOLANA_POLICY_ID;

  if (!clientId) {
    throw new Error("NEXT_PUBLIC_PRIVY_CLIENT_ID is not set");
  }

  if (!privyAppId) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }

  if (!alchemyApiKey) {
    throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={clientId}
      config={{
        defaultChain: baseSepolia,
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
          solana: {
            createOnLogin: "all-users",
          },
          showWalletUIs: false,
        },
        solana: {
          rpcs: {
            "solana:devnet": {
              rpc: createSolanaRpc(
                `https://solana-devnet.g.alchemy.com/v2/${alchemyApiKey}`,
              ),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                "wss://api.devnet.solana.com",
              ),
            },
          },
        },
      }}
    >
      <AlchemyProvider
        apiKey={alchemyApiKey}
        policyId={policyId}
        solanaPolicyId={solanaPolicyId}
        solanaRpcUrl={`https://solana-devnet.g.alchemy.com/v2/${alchemyApiKey}`}
        accountAuthMode="owner"
      >
        {children as any}
      </AlchemyProvider>
    </PrivyProvider>
  );
}
