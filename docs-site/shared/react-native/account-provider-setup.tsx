import "react-native-get-random-values"; // Shims for the crypto module
import React from "react";
import { alchemy, sepolia } from "@account-kit/infra";
import {
  AlchemyAccountProvider,
  createConfig,
} from "@account-kit/react-native";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = createConfig({
  chain: sepolia,
  transport: alchemy({
    apiKey: "YOUR_ALCHEMY_API_KEY",
  }),
  signerConnection: {
    apiKey: "YOUR_ALCHEMY_API_KEY",
  },
  sessionConfig: {
    expirationTimeMs: 1000 * 60 * 60 * 24, // <-- Adjust the session expiration time as needed (currently 24 hours)
  },
});

export default function App() {
  return (
    <AlchemyAccountProvider config={config} queryClient={queryClient}>
      {/* The rest of your app here... */}
    </AlchemyAccountProvider>
  );
}
