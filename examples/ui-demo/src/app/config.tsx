import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { cookieStorage, createConfig } from "@account-kit/react";
import { AccountKitTheme } from "@account-kit/react/tailwind";
import { QueryClient } from "@tanstack/react-query";

export type Config = {
  auth: {
    showEmail: boolean;
    showExternalWallets: boolean;
    showPasskey: boolean;
    addPasskey: boolean;
    showSocial: boolean;
    addGoogleAuth: boolean;
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
  supportUrl?: string;
};

export const DEFAULT_CONFIG: Config = {
  auth: {
    showEmail: true,
    showExternalWallets: false,
    showPasskey: true,
    addPasskey: true,
    showSocial: true,
    addGoogleAuth: true,
  },
  ui: {
    theme: "light",
    primaryColor: {
      light: "#E82594",
      dark: "#FF66CC",
    },
    borderRadius: "sm",
    illustrationStyle: "outline",
    logoLight: undefined,
    logoDark: undefined,
  },
};

export const queryClient = new QueryClient();

export const alchemyConfig = createConfig(
  {
    transport: alchemy({ rpcUrl: "/api/rpc" }),
    chain: arbitrumSepolia,
    ssr: true,
    policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
    storage: cookieStorage,
  },
  {
    illustrationStyle: DEFAULT_CONFIG.ui.illustrationStyle,
    auth: {
      sections: [[{ type: "email" as const }], [{ type: "passkey" as const }]],
      addPasskeyOnSignup: DEFAULT_CONFIG.auth.addPasskey,
      header: (
        <AuthCardHeader
          theme={DEFAULT_CONFIG.ui.theme}
          logoDark={DEFAULT_CONFIG.ui.logoDark}
          logoLight={DEFAULT_CONFIG.ui.logoLight}
        />
      ),
    },
  }
);
