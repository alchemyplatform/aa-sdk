import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import {
  AlchemyAccountsUIConfig,
  AuthType,
  useUiConfig,
} from "@account-kit/react";
import {
  AccountKitTheme,
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

export type Config = {
  auth: {
    showEmail: boolean;
    showExternalWallets: boolean;
    showPasskey: boolean;
    addPasskey: boolean;
  };
  ui: {
    theme: "light" | "dark";
    primaryColor: {
      dark: string;
      light: string;
    };
    borderRadius: AccountKitTheme["borderRadius"];
    illustrationStyle: "outline" | "linear" | "filled" | "flat";
    logoLight:
      | {
          fileName: string;
          fileSrc: string;
        }
      | undefined;
    logoDark:
      | {
          fileName: string;
          fileSrc: string;
        }
      | undefined;
  };
};

export type ConfigContextType = {
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
};

export const DEFAULT_CONFIG: Config = {
  auth: {
    showEmail: true,
    showExternalWallets: false,
    showPasskey: true,
    addPasskey: true,
  },
  ui: {
    theme: "light",
    primaryColor: {
      light: "#363FF9",
      dark: "#9AB7FF",
    },
    borderRadius: "sm",
    illustrationStyle: "outline",
    logoLight: undefined,
    logoDark: undefined,
  },
};

export const ConfigContext = createContext<ConfigContextType>({
  config: DEFAULT_CONFIG,
  setConfig: () => undefined,
});

export function useConfig(): ConfigContextType {
  const configContext = useContext(ConfigContext);

  return configContext;
}

export function ConfigContextProvider(props: PropsWithChildren) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const { updateConfig } = useUiConfig();

  // Sync Alchemy auth UI config
  useEffect(() => {
    const sections: AuthType[][] = [[{ type: "email" }]];

    if (config.auth.showPasskey) {
      sections.push([{ type: "passkey" }]);
    }

    if (config.auth.showExternalWallets && config.auth.showPasskey) {
      sections[1].push({ type: "injected" });
    } else if (config.auth.showExternalWallets) {
      sections.push([{ type: "injected" }]);
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
  }, [config]);

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
    <ConfigContext.Provider value={{ config, setConfig }}>
      {props.children}
    </ConfigContext.Provider>
  );
}
