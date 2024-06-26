"use client";
import { sepolia } from "@aa-sdk/core";
import { createConfig } from "@account-kit/core";
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@account-kit/react";
import { walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useEffect, useMemo, useState } from "react";
import { Config, ConfigContext, DEFAULT_CONFIG } from "./state";
import { mainnet } from "viem/chains";

const alchemyConfig = createConfig({
  // required
  rpcUrl: "/api/rpc",
  chain: mainnet,
  ssr: true,
  connectors: [walletConnect({
    projectId: '1f5d87f54280658983b980eb9efeb71a',
  }), coinbaseWallet()]
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
        illustrationStyle: config.ui.illustrationStyle,
      },
    };
  }, [config]);

  useEffect(() => {
    const root = document.querySelector(':root') as HTMLElement;

    const primaryColor = config.ui.primaryColor[config.ui.theme]
    root?.style.setProperty("--akui-fg-accent-brand", primaryColor)
    root?.style.setProperty("--akui-btn-primary", primaryColor)

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
