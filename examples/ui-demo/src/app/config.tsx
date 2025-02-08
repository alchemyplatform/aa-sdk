import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import {
  odysseyTestnet,
  splitOdysseyTransport,
} from "@/hooks/7702/transportSetup";
import {
  alchemy,
  arbitrumSepolia,
  alchemyFeeEstimator,
} from "@account-kit/infra";
import { cookieStorage, createConfig } from "@account-kit/react";
import { AccountKitTheme } from "@account-kit/react/tailwind";
import { type KnownAuthProvider } from "@account-kit/signer";
import { QueryClient } from "@tanstack/react-query";
import { walletConnect } from "wagmi/connectors";

export type Config = {
  auth: {
    showEmail: boolean;
    showExternalWallets: boolean;
    showPasskey: boolean;
    addPasskey: boolean;
    showOAuth: boolean;
    oAuthMethods: Record<
      KnownAuthProvider | "auth0" | "twitter" | "discord",
      boolean
    >;
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
  walletType: WalletTypes;
  supportUrl?: string;
};

export enum WalletTypes {
  smart = "smart",
  hybrid7702 = "7702",
}

export const DEFAULT_CONFIG: Config = {
  auth: {
    showEmail: true,
    showExternalWallets: true,
    showPasskey: true,
    addPasskey: false,
    showOAuth: true,
    oAuthMethods: {
      google: true,
      facebook: true,
      auth0: false,
      apple: false,
      discord: true,
      twitter: true,
      // TO DO: extend for BYO auth provider
    },
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
  walletType: WalletTypes.smart,
};

export const queryClient = new QueryClient();

export const alchemyConfig = () =>
  createConfig(
    {
      transport: alchemy({ rpcUrl: "/api/rpc" }),
      chain: odysseyTestnet,
      chains: [
        {
          chain: arbitrumSepolia,
          transport: alchemy({ rpcUrl: "/api/rpc" }),
          policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
        },
        {
          chain: odysseyTestnet,
          transport: splitOdysseyTransport,
          policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
          // TODO(jh): do we need to include fee estimator somewhere?
          // i.e. alchemyFeeEstimator(splitOdysseyTransport)
        },
      ],
      ssr: true,
      connectors: [
        walletConnect({ projectId: "30e7ffaff99063e68cc9870c105d905b" }),
      ],
      storage: cookieStorage,
      enablePopupOauth: true,
    },
    {
      illustrationStyle: DEFAULT_CONFIG.ui.illustrationStyle,
      auth: {
        sections: [
          [{ type: "email", emailMode: "otp" }],
          [
            { type: "passkey" },
            { type: "social", authProviderId: "google", mode: "popup" },
            { type: "social", authProviderId: "facebook", mode: "popup" },
          ],
        ],
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
