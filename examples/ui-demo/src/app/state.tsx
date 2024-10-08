"use client";

import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import {
  AlchemyAccountsUIConfig,
  AuthType,
  useUiConfig,
} from "@account-kit/react";
import {
  getBorderRadiusBaseVariableName,
  getBorderRadiusValue,
  getColorVariableName,
} from "@account-kit/react/tailwind";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Config, DEFAULT_CONFIG } from "./config";

export type ConfigContextType = {
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
  nftTransfered: boolean;
  setNFTTransfered: Dispatch<SetStateAction<boolean>>;
};

export const ConfigContext = createContext<ConfigContextType>({
  config: DEFAULT_CONFIG,
  setConfig: () => undefined,
  nftTransfered: false,
  setNFTTransfered: () => undefined,
});

export function useConfig(): ConfigContextType {
  const configContext = useContext(ConfigContext);

  return configContext;
}

export function ConfigContextProvider(props: PropsWithChildren) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [nftTransfered, setNFTTransfered] = useState(false);
  const { updateConfig } = useUiConfig();

  // Sync Alchemy auth UI config
  useEffect(() => {
    console.log("config sync", config);
    const sections: AuthType[][] = [[{ type: "email" }]];

    if (config.auth.showPasskey) {
      sections.push([{ type: "passkey" }]);
    }

    if (config.auth.showExternalWallets) {
      sections.push([
        {
          type: "external_wallets",
          walletConnect: { projectId: "30e7ffaff99063e68cc9870c105d905b" },
        },
      ]);
    }

    const uiConfig: AlchemyAccountsUIConfig = {
      illustrationStyle: config.ui.illustrationStyle,
      auth: {
        sections,
        addPasskeyOnSignup: config.auth.addPasskey && config.auth.showPasskey,
        header: (
          <AuthCardHeader
            theme={config.ui.theme}
            logoDark={config.ui.logoDark}
            logoLight={config.ui.logoLight}
          />
        ),
      },
    };

    updateConfig(uiConfig);
  }, [config, updateConfig]);

  // Sync CSS variables
  useEffect(() => {
    const root = document.querySelector(":root") as HTMLElement;

    const primaryColor = config.ui.primaryColor[config.ui.theme];
    root?.style.setProperty(
      getColorVariableName("fg-accent-brand"),
      primaryColor
    );
    root?.style.setProperty(getColorVariableName("btn-primary"), primaryColor);

    root?.style.setProperty(
      getBorderRadiusBaseVariableName(),
      getBorderRadiusValue(config.ui.borderRadius)
    );

    if (config.ui.theme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [config]);

  return (
    <ConfigContext.Provider
      value={{ config, setConfig, nftTransfered, setNFTTransfered }}
    >
      {props.children}
    </ConfigContext.Provider>
  );
}
