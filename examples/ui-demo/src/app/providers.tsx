"use client";
import { sepolia } from "@aa-sdk/core";
import { createConfig } from "@account-kit/core";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@account-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useEffect, useMemo, useState } from "react";
import { Config, ConfigContext, DEFAULT_CONFIG } from "./state";

const alchemyConfig = createConfig({
  // required
  rpcUrl: "/api/rpc",
  chain: sepolia,
  ssr: true,
});

const queryClient = new QueryClient();

export const Providers = (props: PropsWithChildren<{}>) => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  const uiConfig: AlchemyAccountsProviderProps["uiConfig"] = useMemo(() => {
    return {
      // TODO: read sections fron `config` too
      auth: {
        sections: [[{ type: "email" }], [{ type: "passkey" }]],
        addPasskeyOnSignup: config.auth.addPasskey,
      },
    };
  }, [config]);

  useEffect(() => {
    if (!config.ui.primaryColor) return 

    const root = document.querySelector(':root') as HTMLElement;
    root?.style.setProperty("--akui-fg-accent-brand", config.ui.primaryColor)
    root?.style.setProperty("--akui-btn-primary", config.ui.primaryColor)

    if (config.ui.theme === 'dark') {
      root.classList.remove("light")
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
    }
  }, [config])

  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={alchemyConfig}
          queryClient={queryClient}
          uiConfig={uiConfig}
        >
          <ConfigContext.Provider value={{ config, setConfig }}>
            {props.children}
          </ConfigContext.Provider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
