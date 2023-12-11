"use client";
import { useAlchemyProvider } from "@/hooks/useAlchemyProvider";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useMagicSigner } from "@/hooks/useMagicSigner";
import { PluginType, usePluginManager } from "@/hooks/usePluginManager";
import { useSessionKey } from "@/hooks/useSessionKey";
import {
  MSCA,
  MultiOwnerPlugin,
  SessionKeyPlugin,
  TokenReceiverPlugin,
  type Plugin,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  Address,
  LocalAccountSigner,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { PrivateKeyAccount } from "viem";

type WalletContextProps = {
  // Functions
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  // Properties
  provider: AlchemyProvider;
  ownerAddress?: Address;
  scaAddress?: Address;
  username?: string;
  isLoggedIn: boolean;
  sessionKey?: Address;
  sessionKeySigner?: LocalAccountSigner<PrivateKeyAccount>;
  tokenReceiverEnabled: boolean;
  sessionKeyEnabled: boolean;

  pluginInstall: (
    type: PluginType
  ) => Promise<SendUserOperationResult | undefined>;
  pluginUninstall: (
    type: PluginType
  ) => Promise<SendUserOperationResult | undefined>;
  availablePlugins: Plugin<any, any>[];
  installedPlugins: ReadonlyArray<Address>;
  refetchInstalledPlugins: (scaAddress: Address) => Promise<void>;
};

export const availablePlugins = [
  SessionKeyPlugin,
  MultiOwnerPlugin,
  TokenReceiverPlugin,
];

const defaultUnset: any = null;
const WalletContext = createContext<WalletContextProps>({
  // Default Values
  provider: defaultUnset,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isLoggedIn: defaultUnset,

  sessionKey: defaultUnset,
  sessionKeySigner: defaultUnset,
  tokenReceiverEnabled: defaultUnset,
  sessionKeyEnabled: defaultUnset,

  pluginInstall: () => Promise.resolve(undefined),
  pluginUninstall: () => Promise.resolve(undefined),
  availablePlugins,
  installedPlugins: [],
  refetchInstalledPlugins: () => Promise.resolve(),
});

export const useWalletContext = () => useContext(WalletContext);

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [ownerAddress, setOwnerAddress] = useState<Address>();
  const [username, setUsername] = useState<string>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const { magic, signer } = useMagicSigner();

  const [scaAddress, setScaAddress] = useState<Address>();

  const { provider, connectProviderToAccount, disconnectProviderFromAccount } =
    useAlchemyProvider();

  const {
    installPlugin,
    uninstallPlugin,
    tokenReceiverEnabled,
    sessionKeyEnabled,
    installedPlugins,
    refetchInstalledPlugins,
  } = usePluginManager({ provider, scaAddress });

  const { sessionKeySigner, sessionKey } = useSessionKey({
    provider,
    scaAddress,
    sessionKeyEnabled,
  });

  const login = useCallback(
    async (email: string) => {
      if (!magic || !magic.user || !signer) {
        throw new Error("Magic not initialized");
      }

      const didToken = await magic.auth.loginWithEmailOTP({
        email,
      });
      const metadata = await magic.user.getInfo();
      if (!didToken || !metadata.publicAddress || !metadata.email) {
        throw new Error("Magic login failed");
      }

      setIsLoggedIn(true);
      connectProviderToAccount(signer);

      const _scaAddress = await provider.getAddress();
      console.log("scaAddress", _scaAddress);
      setScaAddress(_scaAddress);

      setUsername(metadata.email);
      setOwnerAddress(metadata.publicAddress as Address);
    },
    [magic, signer, connectProviderToAccount, provider]
  );

  const logout = useCallback(async () => {
    if (!magic || !magic.user) {
      throw new Error("Magic not initialized");
    }

    if (!(await magic.user.logout())) {
      throw new Error("Magic logout failed");
    }

    setIsLoggedIn(false);
    disconnectProviderFromAccount();
    setScaAddress(undefined);
    setUsername(undefined);
    setOwnerAddress(undefined);
  }, [magic, disconnectProviderFromAccount]);

  const pluginInstall = useCallback(
    async (type: PluginType) => {
      if (!provider.isConnected<MSCA>() || !sessionKeySigner) {
        return;
      }
      return await installPlugin(
        type,
        type === PluginType.SESSION_KEY ? [sessionKey] : undefined
      );
    },
    [installPlugin, provider, sessionKey, sessionKeySigner]
  );

  const pluginUninstall = useCallback(
    async (type: PluginType) => {
      if (!provider.isConnected<MSCA>()) {
        return;
      }
      return await uninstallPlugin(type);
    },
    [provider, uninstallPlugin]
  );

  useAsyncEffect(async () => {
    if (!magic || !magic.user || !signer || !provider || isLoggedIn !== null)
      return;

    try {
      const loggedIn = await magic.user.isLoggedIn();
      if (!loggedIn) {
        setIsLoggedIn(false);
        return;
      }

      const metadata = await magic.user.getInfo();
      if (!metadata.publicAddress || !metadata.email) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      connectProviderToAccount(signer);

      const _scaAddress = await provider.getAddress();
      console.log("scaAddress", _scaAddress);
      setScaAddress(_scaAddress);

      setUsername(metadata.email);
      setOwnerAddress(metadata.publicAddress as Address);
    } catch (e) {
      setIsLoggedIn(false);
      console.error(e);
    }
  }, [magic, connectProviderToAccount, signer, provider]);

  return (
    <WalletContext.Provider
      value={{
        login,
        logout,
        isLoggedIn: !!isLoggedIn,
        provider,
        ownerAddress,
        scaAddress,
        username,
        pluginInstall,
        pluginUninstall,
        availablePlugins,
        installedPlugins,
        refetchInstalledPlugins,
        tokenReceiverEnabled,
        sessionKey,
        sessionKeySigner,
        sessionKeyEnabled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
