"use client";

import { getBorderRadiusBaseVariableName, getBorderRadiusValue, getColorVariableName } from "@account-kit/react/tailwind"
import { AlchemyAccountProvider, AlchemyAccountsProviderProps, AlchemyAccountsUIConfig, AuthType, createConfig } from "@account-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, Suspense, useEffect, useMemo, useState } from "react";
import { Config, ConfigContext, DEFAULT_CONFIG } from "./state";
import { sepolia } from "viem/chains";

const queryClient = new QueryClient();

export const Providers = (props: PropsWithChildren<{}>) => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  // Sync Alchemy auth UI config
  const alchemyConfig: AlchemyAccountsProviderProps["config"] = useMemo(() => {
    const sections: AuthType[][] = [[{ type: "passkey" as const }]]
    if (config.auth.showEmail) {
      sections.unshift([{ type: "email" as const }])
    }

    const uiConfig: AlchemyAccountsUIConfig = {
      sections,
      addPasskeyOnSignup: config.auth.addPasskey,
      illustrationStyle: config.ui.illustrationStyle,
      showSignInText: true,
      header: <AuthCardHeader theme={config.ui.theme} logoDark={config.ui.logoDark} logoLight={config.ui.logoLight} />,
    };

    return createConfig({
      // required
      rpcUrl: "/api/rpc",
      chain: sepolia,
      ssr: true,
      ui: uiConfig,
    });
  }, [config]);

  // Sync CSS variables
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
        >
          <ConfigContext.Provider value={{ config, setConfig }}>
            {props.children}
          </ConfigContext.Provider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </Suspense>
  );
};

function AuthCardHeader({ logoDark, logoLight, theme }: Pick<Config['ui'], "theme" | "logoLight" | "logoDark">) {
  const logo = theme === "dark" ? logoDark : logoLight;

  if (!logo) return null;

  return (
    <img
      style={{ height: "60px", objectFit: "contain" }}
      src={logo.fileSrc}
      alt={logo.fileName}
    />
  );
};
