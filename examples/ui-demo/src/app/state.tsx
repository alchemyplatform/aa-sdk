import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type Config = {
    auth: {
        showEmail: boolean;
        showExternalWallets: boolean;
        addPasskey: boolean
    },
    ui: {
        theme: 'light' | 'dark';
        primaryColor: string;
        borderRadius: 'none' | 'sm' | 'md' | 'lg';
        illustrationStyle: number;
    }
}

type ConfigType = { config: Config; setConfig: Dispatch<SetStateAction<Config>>}

export const DEFAULT_CONFIG: Config = {
    auth: {
        showEmail: true,
        showExternalWallets: false,
        addPasskey: false,
    },
    ui: {
        theme: 'light',
        primaryColor: '#363FF9',
        borderRadius: 'none',
        illustrationStyle: 0,
    },
}

export const ConfigContext = createContext<ConfigType>({
    config: DEFAULT_CONFIG,
    setConfig: () => undefined,
});

export function useConfig(): ConfigType {
    const configContext = useContext(ConfigContext);
    
    if (!configContext) {
        throw new Error("useConfig must be used within a config context provider")
    }

    return configContext
}