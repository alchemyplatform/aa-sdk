"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { AlchemyProvider } from "@account-kit/privy-integration";
import { baseSepolia } from "viem/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const policyId = process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID;
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

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
    <AlchemyProvider apiKey={alchemyApiKey} policyId={policyId}>
      <PrivyProvider
        appId={privyAppId}
        clientId={clientId}
        config={{
          defaultChain: baseSepolia,
          embeddedWallets: {
            ethereum: {
              createOnLogin: "all-users",
            },
            showWalletUIs: false,
          },
        }}
      >
        {children as any}
      </PrivyProvider>
    </AlchemyProvider>
  );
}
