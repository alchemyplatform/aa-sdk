"use client";
import { createConfig } from "@alchemy/aa-alchemy/config";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@alchemy/aa-alchemy/react";
import { sepolia } from "@alchemy/aa-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useState } from "react";
import { Config, ConfigContext, DEFAULT_CONFIG } from "./state";

const alchemyConfig = createConfig({
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
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient} uiConfig={uiConfig}>
          <ConfigContext.Provider value={{ config, setConfig }}>
            {props.children}
          </ConfigContext.Provider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
