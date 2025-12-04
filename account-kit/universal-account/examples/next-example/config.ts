/**
 * Configuration for Alchemy Account Kit + Particle Universal Accounts
 *
 * This file sets up both:
 * 1. Alchemy Account Kit - for authentication (email, passkey, social, wallet)
 * 2. Particle Universal Accounts - for chain abstraction
 */

import { createConfig, cookieStorage } from "@account-kit/react";
import { mainnet, alchemy } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";
import type { UniversalAccountProviderConfig } from "@account-kit/universal-account";

// =============================================================================
// STEP 1: Alchemy Account Kit Configuration
// =============================================================================
// This handles user authentication and provides the EOA (signer) that will
// control the Universal Account.
//
// This stays the standard configuration for Alchemy Account Kit.
//
// Get your Alchemy API key from: https://dashboard.alchemy.com/
export const config = createConfig(
  {
    // Alchemy RPC transport - used for blockchain interactions
    transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),

    // Default chain for Alchemy Account Kit (can be any EVM chain)
    // Note: Universal Accounts work across ALL chains regardless of this setting
    chain: mainnet,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
  },
  {
    // Authentication options - customize which login methods to show
    auth: {
      sections: [
        [{ type: "email" }],
        [
          { type: "passkey" }, 
          { type: "social", authProviderId: "google", mode: "popup" }, 
        ],
        [{ type: "external_wallets" }], 
      ],
      addPasskeyOnSignup: true,
    },
  },
);

export const queryClient = new QueryClient();

// =============================================================================
// STEP 2: Particle Universal Account Configuration
// =============================================================================
// This enables chain abstraction - unified balance and cross-chain transactions.
//
// Get your Particle credentials from: https://dashboard.particle.network/
export const universalAccountConfig: UniversalAccountProviderConfig = {
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
  clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
  appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,

  // Optional: Trade configuration
  // tradeConfig: {
  //   slippageBps: 100,    // 1% slippage tolerance
  //   universalGas: true,  // Use PARTI token for gas fees
  // },
};
