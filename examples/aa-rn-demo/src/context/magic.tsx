import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { useAsyncEffect } from "@hooks/useAsyncEffect";
import {
  OAuthExtension,
  type OAuthRedirectResult,
} from "@magic-ext/react-native-bare-oauth";
import { Magic } from "@magic-sdk/react-native-bare";
import { alchemyRpcUrl, chain, magicApiKey } from "@shared-config/env";
import _ from "lodash";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type MagicAuthType } from "types/magic";
import { createWalletClient, custom, type WalletClient } from "viem";

type MagicContextProps = {
  walletClient?: WalletClient;
  signer?: SmartAccountSigner;
  login: (
    type: MagicAuthType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...params: any[]
  ) => Promise<string | string[] | OAuthRedirectResult | null | undefined>;
  logout: () => Promise<boolean | undefined>;
};

export const magic = new Magic(magicApiKey, {
  network: {
    rpcUrl: alchemyRpcUrl,
    chainId: 11155111,
  },
  extensions: [new OAuthExtension()],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultUnset: any = null;
const MagicContext = createContext<MagicContextProps>({
  login: defaultUnset,
  logout: defaultUnset,
});

export const useMagicContext = () => useContext(MagicContext);

export const MagicProvider = ({ children }: { children: ReactNode }) => {
  const [walletClient, setWalletClient] = useState<WalletClient>();
  const [signer, setSigner] = useState<SmartAccountSigner>();

  useEffect(() => {
    const magicClient: WalletClient = createWalletClient({
      chain,
      transport: custom(magic.rpcProvider),
    });

    const magicSigner: SmartAccountSigner = new WalletClientSigner(
      magicClient,
      "magic",
    );

    setWalletClient(magicClient);
    setSigner(magicSigner);
  }, []);

  useAsyncEffect(async () => {
    if (!walletClient) return;
    const [addresses, chainId] = await Promise.all([
      walletClient.getAddresses(),
      walletClient.getChainId(),
    ]);
    console.log(
      `[useMagicContext] Connected to ${_.first(
        addresses,
      )} on chain ${chainId}`,
    );
  }, [walletClient?.account, walletClient?.chain]);

  const login = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (type: MagicAuthType, ...params: any[]) => {
      if (!magic) return;
      switch (type) {
        case "google":
        case "apple":
          return magic.oauth.loginWithPopup({
            provider: type,
            redirectURI: "accountkitboilerplate://",
          });
        case "email":
          // returns did
          return magic.auth.loginWithEmailOTP({ email: params[0] });
        case "sms":
          // returns did
          return magic.auth.loginWithSMS({
            phoneNumber: params[0],
          });
        case "magic":
          // returns accounts
          return magic.wallet.connectWithUI();
        default:
          throw new Error(`Invalid auth type ${type}`);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    if (!magic) return;
    return magic.user.logout();
  }, []);

  return (
    <MagicContext.Provider
      value={{
        walletClient,
        signer,
        login,
        logout,
      }}
    >
      {children}
    </MagicContext.Provider>
  );
};
