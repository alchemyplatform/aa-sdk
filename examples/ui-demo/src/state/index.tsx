"use client";

import { Config } from "@/app/config";
import { AlchemyClientState } from "@account-kit/core";
import { useUiConfig } from "@account-kit/react";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import {
  convertDemoConfigToUiConfig,
  createDemoStore,
  deepEqual,
  DemoState,
  generateClassesForRoot,
  generateStylesForRoot,
} from "./store";

export type ConfigContextType = {
  store: ReturnType<typeof createDemoStore>;
};

export const ConfigContext = createContext<
  ReturnType<typeof createDemoStore> | undefined
>(undefined);

export function useConfigStore<T = DemoState>(
  selector?: (state: DemoState) => T,
): T {
  const configContext = useContext(ConfigContext);

  if (!configContext) {
    throw new Error("config context must be present in root");
  }

  return useStoreWithEqualityFn(
    configContext,
    selector ?? ((state) => state),
    deepEqual,
  );
}

export function ConfigContextProvider(
  props: PropsWithChildren<{
    initialConfig?: Config;
    initialState?: AlchemyClientState;
  }>,
) {
  const storeRef = useRef<ReturnType<typeof createDemoStore>>();
  if (!storeRef.current) {
    storeRef.current = createDemoStore(props.initialConfig);
  }

  return (
    <ConfigContext.Provider value={storeRef.current}>
      {props.children}
    </ConfigContext.Provider>
  );
}

// making this a component so we can use the config store hook from the above provider
export function ConfigSync() {
  const config = useConfigStore((config) => config);
  const { updateConfig } = useUiConfig((state) => ({
    updateConfig: state.updateConfig,
  }));

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

    const uiConfig = convertDemoConfigToUiConfig(config);

    updateConfig(uiConfig);
  }, [config, updateConfig]);

  return null;
}
