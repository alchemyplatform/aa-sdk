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
  updateConfig: (partial: Partial<Config>) => void;
};

export const createDemoStore = (initialConfig: Config = DEFAULT_CONFIG) =>
  createStore(
    persist<DemoStore, [], [], { config: Config }>(
      (set, get) => ({
        config: initialConfig,
        updateConfig: (partial: Partial<Config>) => {
          const { config } = get();
          set({
            config: {
              ...config,
              ...partial,
            },
          });
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
