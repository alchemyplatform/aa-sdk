import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { type Address, type Hex } from "@alchemy/aa-core";
import { magic, useMagicContext } from "@context/magic";
import { useAlchemyProvider } from "@hooks/useAlchemyProvider";
import { useAsyncEffect } from "@hooks/useAsyncEffect";
import type { OAuthRedirectResult } from "@magic-ext/react-native-bare-oauth";
import { entryPointAddress } from "@shared-config/env";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import RNRestart from "react-native-restart";
import type { MagicAuth, MagicAuthType } from "types/magic";
import { useAlertContext } from "./alert";

type WalletContextProps = {
  loading: boolean;

  // Functions
  login: (type: MagicAuthType, ...params: any[]) => Promise<void>;
  logout: () => Promise<void>;

  // Properties
  provider: AlchemyProvider;
  scaAddress?: Address;
  magicAuth?: MagicAuth;
};

const defaultUnset: any = null;
const WalletContext = createContext<WalletContextProps>({
  // Default Values
  provider: defaultUnset,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  loading: false,
});

export const useWalletContext = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { dispatchAlert } = useAlertContext();

  const [scaAddress, setScaAddress] = useState<Address>();
  const [loading, setLoading] = useState<boolean>(true);

  const [magicAuth, setMagicAuth] = useState<MagicAuth>();
  const { signer, login: magicLogin, logout: magicLogout } = useMagicContext();
  const { provider, connectProviderToAccount, disconnectProviderFromAccount } =
    useAlchemyProvider({
      entryPointAddress,
    });

  const login = useCallback(
    async (type: MagicAuthType, ...params: any[]) => {
      try {
        const res = await magicLogin(type, ...params);
        const metaData = await magic.user.getInfo();

        setMagicAuth({
          address: metaData.publicAddress,
          isLoggedIn: true,
          metaData,
          did: type === "email" || type === "sms" ? String(res) : undefined,
          email: metaData.email,
          phoneNumber: metaData.phoneNumber,
          oAuthRedirectResult:
            type === "google" || type === "apple"
              ? (res as OAuthRedirectResult)
              : undefined,
        });

        dispatchAlert({
          type: "open",
          alertType: "success",
          message: `Logged in using ${type}`,
        });
      } catch (error) {
        console.error(error);
        setMagicAuth({
          address: null,
          isLoggedIn: false,
          metaData: null,
        });
        dispatchAlert({
          type: "open",
          alertType: "error",
          message: `Error logging in using ${type}`,
        });
      }
    },
    [magicLogin, dispatchAlert],
  );

  useAsyncEffect(async () => {
    if (magicAuth === undefined || !magicAuth.isLoggedIn || !signer) {
      return;
    }
    if (!provider.isConnected()) {
      await connectProviderToAccount(signer);
      const _scaAddress = await provider.getAddress();
      console.log("new login, connecting provider to account", _scaAddress);
      setScaAddress(_scaAddress);
      return;
    }
  }, [magicAuth?.isLoggedIn]);

  const logout = useCallback(async () => {
    try {
      await magicLogout();
    } catch (error) {
      console.error(error);
    } finally {
      setMagicAuth({
        address: null,
        isLoggedIn: false,
        metaData: null,
      });
      disconnectProviderFromAccount();
      setScaAddress(undefined);
      dispatchAlert({
        type: "open",
        alertType: "info",
        message: "Logged out",
      });
      RNRestart.restart();
    }
  }, [magicLogout, disconnectProviderFromAccount, dispatchAlert]);

  useAsyncEffect(async () => {
    if (magicAuth || !signer) {
      return;
    }

    const isLoggedIn = await magic.user.isLoggedIn();
    if (!isLoggedIn) {
      setLoading(false);
      setMagicAuth({
        address: null,
        isLoggedIn: false,
        metaData: null,
      });
      return;
    }

    const metaData = await magic.user.getInfo();
    setMagicAuth({
      address: metaData.publicAddress,
      isLoggedIn: true,
      metaData,
      email: metaData.email,
      phoneNumber: metaData.phoneNumber,
    });

    const _scaAddress: Hex = await provider.getAddress();
    console.log(
      "User already logged in",
      metaData,
      provider.isConnected(),
      _scaAddress,
    );
    if (provider.isConnected()) {
      setScaAddress(_scaAddress);
    } else {
      console.log("alread logged in, connecting provider to account");
      await connectProviderToAccount(signer);
      setScaAddress(_scaAddress);
    }
    setLoading(false);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        loading,
        login,
        logout,
        magicAuth,
        provider,
        scaAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
