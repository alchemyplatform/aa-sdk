import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type Config = {
    auth: {
        showEmail: boolean;
        showExternalWallets: boolean;
        addPasskey: boolean
    }
}

type ConfigContext = { config: Config; setConfig: Dispatch<SetStateAction<Config>>}

export const DEFAULT_CONFIG = {
    auth: {
        showEmail: true,
        showExternalWallets: false,
        addPasskey: false,
    },
}

export const ConfigContext = createContext<ConfigContext>({
    config: DEFAULT_CONFIG,
    setConfig: () => undefined,
});

export function useConfig(): ConfigContext {
    const configContext = useContext(ConfigContext);
    
    if (!configContext) {
        throw new Error("useConfig must be used within a config context provider")
    }

    return configContext
}