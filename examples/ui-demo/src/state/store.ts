import { Config, DEFAULT_CONFIG } from "@/app/config";
import { cookieStorage, parseCookie } from "@account-kit/core";
import {
  getBorderRadiusBaseVariableName,
  getBorderRadiusValue,
  getColorVariableName,
} from "@account-kit/react/tailwind";
import { createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STATE_KEY = "account-kit-demo-config-store";

export type DemoStore = {
  config: Config;
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
};

export const createDemoStore = (initialConfig: Config = DEFAULT_CONFIG) =>
  createStore(
    persist<DemoStore, [], [], { config: Config }>(
      (set, get) => ({
        config: initialConfig,
        setTheme: (theme) => {
          set((state) => ({
            config: {
              ...state.config,
              ui: {
                ...state.config.ui,
                theme,
              },
            },
          }));
        },
        setSupportUrl: (url) => {
          set((state) => ({
            config: {
              ...state.config,
              supportUrl: url,
            },
          }));
        },
        setLogo: (theme, logo) => {
          set((state) => ({
            config: {
              ...state.config,
              ui: {
                ...state.config.ui,
                [theme]: logo,
              },
            },
          }));
        },
        setPrimaryColor: (theme, color) => {
          set((state) => ({
            config: {
              ...state.config,
              ui: {
                ...state.config.ui,
                primaryColor: {
                  ...state.config.ui.primaryColor,
                  [theme]: color,
                },
              },
            },
          }));
        },
        setAuth: (auth) => {
          set((state) => ({
            config: {
              ...state.config,
              auth: {
                ...state.config.auth,
                ...auth,
              },
            },
          }));
        },
        setIllustrationStyle: (style: Config["ui"]["illustrationStyle"]) => {
          set((state) => ({
            config: {
              ...state.config,
              ui: {
                ...state.config.ui,
                illustrationStyle: style,
              },
            },
          }));
        },
        setBorderRadius: (radius: Config["ui"]["borderRadius"]) => {
          set((state) => ({
            config: {
              ...state.config,
              ui: {
                ...state.config.ui,
                borderRadius: radius,
              },
            },
          }));
        },
      }),
      {
        name: STATE_KEY,
        storage: createJSONStorage(() => cookieStorage()),
        partialize: ({ config }) => ({ config }),
        skipHydration: true,
        version: 1,
      }
    )
  );

function deserialize<type>(value: string): type {
  return JSON.parse(decodeURIComponent(value));
}

export function cookieToInitialConfig(cookie?: string | null) {
  if (!cookie) return;

  const state = parseCookie(cookie, STATE_KEY);
  if (!state) return;

  const { config } = deserialize<{ state: { config: Config } }>(state).state;

  return config;
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
