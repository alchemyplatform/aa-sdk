import { Dispatch, SetStateAction, createContext, useContext } from "react";

export type Config = {
    auth: {
        showEmail: boolean;
        showExternalWallets: boolean;
        addPasskey: boolean
    },
    ui: {
        theme: 'light' | 'dark';
        primaryColor: {
            dark: string;
            light: string;
        }
        borderRadius: 'none' | 'sm' | 'md' | 'lg';
        illustrationStyle: 'outline' | 'linear' | 'filled' | 'flat';
        logoLight: {
            fileName: string;
            fileSrc: string;
        } | undefined;
        logoDark: {
            fileName: string;
            fileSrc: string;
        } | undefined;
    }
}

export type ConfigContextType = { config: Config; setConfig: Dispatch<SetStateAction<Config>>}

export const DEFAULT_CONFIG: Config = {
    auth: {
        showEmail: true,
        showExternalWallets: false,
        addPasskey: false,
    },
    ui: {
        theme: 'light',
        primaryColor: {
            light: '#363FF9',
            dark: '#9AB7FF',
        },
        borderRadius: 'none',
        illustrationStyle: 'outline',
        logoLight: undefined,
        logoDark: undefined,
    },
}

export const ConfigContext = createContext<ConfigContextType>({
    config: DEFAULT_CONFIG,
    setConfig: () => undefined,
});

export function useConfig(): ConfigContextType {
    const configContext = useContext(ConfigContext);
    
    if (!configContext) {
        throw new Error("useConfig must be used within a config context provider")
    }

    return configContext
}