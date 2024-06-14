"use client";
import { createConfig } from "@alchemy/aa-alchemy/config";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@alchemy/aa-alchemy/react";
import { sepolia } from "@aa-sdk/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense } from "react";

const config = createConfig({
  // required
  rpcUrl: "/api/rpc",
  chain: sepolia,
  ssr: true,
});

const queryClient = new QueryClient();

// TODO: this is starting to break the "5 lines or less" mentality.
// we should export a default uiConfig which has our recommended config
const uiConfig: AlchemyAccountsProviderProps["uiConfig"] = {
  auth: {
    sections: [[{type: "email"}], [{type: "passkey"}]],
    addPasskeyOnSignup: true,
  },
};

export const Providers = (props: PropsWithChildren<{}>) => {
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider config={config} queryClient={queryClient} uiConfig={uiConfig}>
          {props.children}
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
