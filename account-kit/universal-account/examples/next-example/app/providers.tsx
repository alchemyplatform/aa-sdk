"use client";

/**
 * Provider Setup for Alchemy Account Kit + Particle Universal Accounts
 *
 * PROVIDER HIERARCHY (order matters!):
 * 1. QueryClientProvider - React Query for data fetching
 * 2. AlchemyAccountProvider - Authentication & signing
 * 3. UniversalAccountProvider - Chain abstraction
 *
 * The UniversalAccountProvider must be INSIDE AlchemyAccountProvider
 * because it uses Alchemy's signer for transaction signing.
 */

import { config, queryClient, universalAccountConfig } from "@/config";
import {
  AlchemyAccountProvider,
  AlchemyAccountsProviderProps,
} from "@account-kit/react";
import { UniversalAccountProvider } from "@account-kit/universal-account";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

export const Providers = (
  props: PropsWithChildren<{
    initialState?: AlchemyAccountsProviderProps["initialState"];
  }>,
) => {
  return (
    // Step 1: React Query for data fetching/caching
    <QueryClientProvider client={queryClient}>
      {/* Step 2: Alchemy Account Kit - handles authentication */}
      <AlchemyAccountProvider
        config={config}
        queryClient={queryClient}
        initialState={props.initialState}
      >
        {/* Step 3: Universal Accounts - enables chain abstraction */}
        {/* Must be inside AlchemyAccountProvider to access the signer */}
        <UniversalAccountProvider config={universalAccountConfig}>
          {props.children}
        </UniversalAccountProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
};
