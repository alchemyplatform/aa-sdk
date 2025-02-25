import { AccountMode, Config, DEFAULT_CONFIG } from "@/app/config";
import { getSectionsForConfig } from "@/app/sections";
import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import { cookieStorage, parseCookie } from "@account-kit/core";
import { AlchemyAccountsUIConfig } from "@account-kit/react";
import {
  getBorderRadiusBaseVariableName,
  getBorderRadiusValue,
  getColorVariableName,
} from "@account-kit/react/tailwind";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore, StateCreator } from "zustand/vanilla";

const STATE_KEY = "account-kit-demo-config-store";

export function convertDemoConfigToUiConfig(
  config: Config
): AlchemyAccountsUIConfig {
  return {
    auth: {
      sections: getSectionsForConfig(
        config,
        "30e7ffaff99063e68cc9870c105d905b"
      ),
      addPasskeyOnSignup: config.auth.addPasskey && config.auth.showPasskey,
      header: (
        <AuthCardHeader
          theme={config.ui.theme}
          logoDark={config.ui.logoDark}
          logoLight={config.ui.logoLight}
        />
      ),
    },
    illustrationStyle: config.ui.illustrationStyle,
    supportUrl: config.supportUrl,
  };
}

export type DemoState = Config & {
  nftTransferred: boolean;
  setNftTransferred: (transferred: boolean) => void;
  setIllustrationStyle: (style: Config["ui"]["illustrationStyle"]) => void;
  setBorderRadius: (radius: Config["ui"]["borderRadius"]) => void;
  setAuth: (auth: Partial<Config["auth"]>) => void;
  setPrimaryColor: (theme: "dark" | "light", color: string) => void;
  setLogo: <TTheme extends "logoDark" | "logoLight">(
    theme: TTheme,
    logo: Config["ui"][TTheme]
  ) => void;
  setTheme: (theme: Config["ui"]["theme"]) => void;
  setSupportUrl: (url: string) => void;
  setAccountMode: (accountMode: AccountMode) => void;
};

export const createDemoStore = (initialConfig: Config = DEFAULT_CONFIG) => {
  return createStore<DemoState, [] | [["zustand/persist", Config]]>(
    typeof window === "undefined"
      ? createInitialState(initialConfig)
      : persist(createInitialState(initialConfig), {
          name: STATE_KEY,
          storage: createJSONStorage(() => cookieStorage()),
          partialize: ({
            setAuth,
            setBorderRadius,
            setIllustrationStyle,
            setLogo,
            setPrimaryColor,
            setSupportUrl,
            setTheme,
            setNftTransferred,
            nftTransferred,
            setAccountMode,
            ...config
          }) => config,
          skipHydration: true,
          version: 2,
        })
  );
};

function createInitialState(
  initialConfig: Config = DEFAULT_CONFIG
): StateCreator<DemoState> {
  return (set, get) => ({
    ...initialConfig,
    nftTransferred: false,
    setNftTransferred: (transferred) => {
      set({ nftTransferred: transferred });
    },
    setTheme: (theme) => {
      set((state) => ({
        ui: {
          ...state.ui,
          theme,
        },
      }));
    },
    setSupportUrl: (url) => {
      set(() => ({
        supportUrl: url,
      }));
    },
    setLogo: (theme, logo) => {
      set((state) => ({
        ui: {
          ...state.ui,
          [theme]: logo,
        },
      }));
    },
    setPrimaryColor: (theme, color) => {
      set((state) => ({
        ui: {
          ...state.ui,
          primaryColor: {
            ...state.ui.primaryColor,
            [theme]: color,
          },
        },
      }));
    },
    setAuth: (auth) => {
      set((state) => ({
        auth: {
          ...state.auth,
          ...auth,
        },
      }));
    },
    setIllustrationStyle: (style: Config["ui"]["illustrationStyle"]) => {
      set((state) => ({
        ui: {
          ...state.ui,
          illustrationStyle: style,
        },
      }));
    },
    setBorderRadius: (radius: Config["ui"]["borderRadius"]) => {
      set((state) => ({
        ui: {
          ...state.ui,
          borderRadius: radius,
        },
      }));
    },
    setAccountMode: (accountMode: AccountMode) => {
      set(() => ({
        accountMode,
      }));
    },
  });
}

function deserialize<type>(value: string): type {
  return JSON.parse(decodeURIComponent(value));
}

export function cookieToInitialConfig(cookie?: string | null) {
  if (!cookie) return;

  const state = parseCookie(cookie, STATE_KEY);
  if (!state) return;

  return deserialize<{ state: Config }>(state).state;
}

export function generateStylesForRoot(config: Config) {
  const primaryColor = config.ui.primaryColor[config.ui.theme];

  return [
    [getColorVariableName("fg-accent-brand"), primaryColor],
    [getColorVariableName("btn-primary"), primaryColor],
    [
      getBorderRadiusBaseVariableName(),
      getBorderRadiusValue(config.ui.borderRadius),
    ],
  ];
}

export function generateClassesForRoot(config: Config): string[] {
  return [config.ui.theme];
}

export function deepEqual(a: any, b: any): boolean {
  if (typeof a !== typeof b) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if (
    typeof a === "object" &&
    typeof b === "object" &&
    a != null &&
    b != null &&
    Array.isArray(a) === Array.isArray(b)
  ) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (let key of aKeys) {
      if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  } else {
    return a === b;
  }
}
