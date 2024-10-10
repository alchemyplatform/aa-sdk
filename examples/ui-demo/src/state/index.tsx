"use client";

import { alchemyConfig, Config, queryClient } from "@/app/config";
import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import { AlchemyClientState } from "@account-kit/core";
import {
  AlchemyAccountProvider,
  AlchemyAccountsUIConfig,
  AuthType,
  useUiConfig,
} from "@account-kit/react";
import { KnownAuthProvider } from "@account-kit/signer";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import {
  createDemoStore,
  generateClassesForRoot,
  generateStylesForRoot,
} from "./store";

export type ConfigContextType = {
  config: Config;
  setConfig: (partial: Partial<Config>) => void;
  nftTransferred: boolean;
  setNFTTransferred: Dispatch<SetStateAction<boolean>>;
};

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined
);

export function useConfig(): ConfigContextType {
  const configContext = useContext(ConfigContext);

  if (!configContext) {
    throw new Error("config context must be present in root");
  }

  return configContext;
}

function convertDemoConfigToUiConfig(config: Config): AlchemyAccountsUIConfig {
  const sections: AuthType[][] = [[{ type: "email" }]];

  if (config.auth.showPasskey) {
    sections.push([{ type: "passkey" }]);
  }

  if (config.auth.showOAuth && !config.auth.showPasskey) {
    sections.push([]);
  }

  if (config.auth.showOAuth) {
    Object.entries(config.auth.oAuthMethods)
      .filter(([, enabled]) => enabled)
      .forEach(([method]) => {
        sections.at(-1)?.push({
          type: "social",
          authProviderId: method as KnownAuthProvider,
          mode: "popup",
        });
      });
  }

  if (config.auth.showExternalWallets) {
    sections.push([
      {
        type: "external_wallets",
        walletConnect: { projectId: "30e7ffaff99063e68cc9870c105d905b" },
      },
    ]);
  }

  return {
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
}

export function ConfigContextProvider(
  props: PropsWithChildren<{
    initialConfig?: Config;
    initialState?: AlchemyClientState;
  }>
) {
  const storeRef = useRef<ReturnType<typeof createDemoStore>>();
  if (!storeRef.current) {
    storeRef.current = createDemoStore(props.initialConfig);
  }

  const { config, updateConfig: setConfig } = useStore(storeRef.current);
  const [nftTransfered, setNFTTransfered] = useState(false);

  // Sync Alchemy auth UI config
  const uiConfig = useMemo(() => {
    return convertDemoConfigToUiConfig(config);
  }, [config]);

  const localAlchemyConfig = useMemo(
    () => ({
      ...alchemyConfig,
      ui: uiConfig,
    }),
    [uiConfig]
  );

  return (
    <ConfigContext.Provider
      value={{
        config,
        setConfig,
        nftTransferred: nftTransfered,
        setNFTTransferred: setNFTTransfered,
      }}
    >
      <AlchemyAccountProvider
        config={localAlchemyConfig}
        queryClient={queryClient}
        initialState={props.initialState}
      >
        {props.children}
      </AlchemyAccountProvider>
    </ConfigContext.Provider>
  );
}

export function ConfigSync(props: PropsWithChildren) {
  const { config } = useConfig();
  const { updateConfig } = useUiConfig();

  // Sync UI config changes
  useEffect(() => {
    const uiConfig = convertDemoConfigToUiConfig(config);
    updateConfig(uiConfig);
  }, [config, updateConfig]);

  // Sync CSS variables
  useEffect(() => {
    const styles = generateStylesForRoot(config);
    const classes = generateClassesForRoot(config);
    const root = document.querySelector(":root") as HTMLElement;

    styles.forEach((x) => root.style.setProperty(x[0], x[1]));

    root.classList.forEach((x) => {
      if (!classes.includes(x)) {
        root.classList.remove(x);
      }
    });

    classes.forEach((x) => root.classList.add(x));
  }, [config]);

  return props.children;
}
