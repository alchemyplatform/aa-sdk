"use client";
import { sepolia } from "@aa-sdk/core";
import { createConfig } from "@account-kit/core";
import { getBorderRadiusBaseVariableName, getColorVariableName } from "@account-kit/react/tailwind"
import { AlchemyAccountProvider, AlchemyAccountsProviderProps } from "@account-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useEffect, useMemo, useState } from "react";
import { Config, ConfigContext, DEFAULT_CONFIG } from "./state";
import { getBorderRadiusValue } from "@account-kit/react/tailwind";

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
        illustrationStyle: config.ui.illustrationStyle,
      },
    };
  }, [config]);

  useEffect(() => {
    const root = document.querySelector(':root') as HTMLElement;

    const primaryColor = config.ui.primaryColor[config.ui.theme]
    root?.style.setProperty(getColorVariableName("fg-accent-brand"), primaryColor)
    root?.style.setProperty(getColorVariableName("btn-primary"), primaryColor)
  
    root?.style.setProperty(getBorderRadiusBaseVariableName(), getBorderRadiusValue(config.ui.borderRadius))

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
