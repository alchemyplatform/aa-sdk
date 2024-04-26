"use client";

import { createConfig } from "@alchemy/aa-alchemy/config";
import { AlchemyAccountProvider } from "@alchemy/aa-alchemy/react";
import { arbitrumSepolia } from "@alchemy/aa-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";

// It's important that these are constant across renders, or else you'll wipe
// out the underlying state
const queryClient = new QueryClient();
const config = createConfig({
  rpcUrl: "/api/rpc", // this will proxy requests through the app's backend via NextJS routing to hide the Alchemy API key
  chain: arbitrumSepolia,
});

export const Providers = (props: PropsWithChildren) => {
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider config={config} queryClient={queryClient}>
          {props.children}
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
