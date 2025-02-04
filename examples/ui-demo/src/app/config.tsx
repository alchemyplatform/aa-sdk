import { AuthCardHeader } from "@/components/shared/AuthCardHeader";
import { alchemy, base, sepolia } from "@account-kit/infra";
import {
  AlchemyAccountsUIConfig,
  cookieStorage,
  createConfig,
} from "@account-kit/react";
import { AccountKitTheme } from "@account-kit/react/tailwind";
import { type KnownAuthProvider } from "@account-kit/signer";
import { QueryClient } from "@tanstack/react-query";
import { Chain } from "viem/chains";
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
  supportUrl?: string;
};

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
};

export const queryClient = new QueryClient();

export const defaultChain = base;

export enum SDKSupportedNetworkIdsEnum {
  DEFAULT = defaultChain.id,
}

export const SDKChainIdToAAChainMap: {
  [key in string]: Chain;
} = {
  [defaultChain.id]: defaultChain,
};

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [
        { type: "passkey" },
        // to be re-enabled once verified
        // { type: 'social', authProviderId: 'google', mode: 'popup' },
        // { type: 'social', authProviderId: 'facebook', mode: 'popup' },
      ],
      [
        {
          type: "external_wallets",
          walletConnect: { projectId: "832580820193ff6bae62a15dc0feff03" },
        },
      ],
    ],
    addPasskeyOnSignup: true,
  },
};

export const getAccountKitConfig = ({
  forkRpcUrl,
  chainId,
}: {
  forkRpcUrl?: string;
  chainId?: SDKSupportedNetworkIdsEnum;
}) => {
  return createConfig(
    {
      transport: alchemy({
        rpcUrl: "/api/rpc",
      }),
      signerConnection: {
        // this is for Alchemy Signer requests
        rpcUrl: "/api/rpc",
      },
      chain: {
        [SDKSupportedNetworkIdsEnum.DEFAULT]: defaultChain,
      }[chainId ?? defaultChain.id] as Chain,
      chains: Object.values(SDKChainIdToAAChainMap).map((chain) => ({
        chain,
        policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID,
      })),
      ssr: true,
      storage: cookieStorage,
    },
    uiConfig
  );
};

export const alchemyConfig = () =>
  getAccountKitConfig({
    chainId: defaultChain.id,
  });
