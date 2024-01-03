import { createLocalAccount } from "@/shared/util";
import { IAccountLoupe, MSCA, SessionKeyPlugin } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import { Address, Hex, PrivateKeyAccount } from "viem";
import { useAsyncEffect } from "./useAsyncEffect";

export const useSessionKey = ({
  scaAddress,
  provider,
  sessionKeyEnabled,
}: {
  scaAddress: Address | undefined;
  provider: AlchemyProvider;
  sessionKeyEnabled: boolean;
}) => {
  const [sessionKey, setSessionKey] = useState<Address>();
  const [sessionKeySigner, setSessionKeySigner] =
    useState<LocalAccountSigner<PrivateKeyAccount>>();

  useAsyncEffect(async () => {
    if (scaAddress == null || !provider.isConnected<MSCA>()) {
      return;
    }

    const storedSessionKey = window.localStorage.getItem(
      "msca-sessionkey"
    ) as Address;
    const storedSessionKeySecret = window.localStorage.getItem(
      "msca-sessionkey-secret"
    ) as Hex;

    const currentSessionKeys = await provider.account
      .extend(SessionKeyPlugin.accountMethods)
      .readGetSessionKeys();
    console.log("current session keys", currentSessionKeys);

    const restoreSessionKey =
      storedSessionKey &&
      storedSessionKeySecret &&
      currentSessionKeys.includes(storedSessionKey);

    const signer = restoreSessionKey
      ? LocalAccountSigner.privateKeyToAccountSigner(storedSessionKeySecret)
      : await createSessionKeySigner();

    setSessionKeySigner(signer);
    const _sessionKey = await signer!.getAddress();
    console.log("session key", _sessionKey);
    setSessionKey(_sessionKey);
  }, [provider, scaAddress, sessionKeyEnabled]);

  const createSessionKeySigner = useCallback(async () => {
    if (scaAddress == null || !provider.isConnected<MSCA>()) {
      return;
    }
    const [signer, pkey] = createLocalAccount();
    const pubKey = await signer.getAddress();
    window.localStorage.setItem("msca-sessionkey", pubKey);
    window.localStorage.setItem("msca-sessionkey-secret", pkey);
    setSessionKeySigner(signer);
    console.log(`New session key signer ${pubKey}`);
    return signer;
  }, [provider, scaAddress]);

  const updateSessionKeys = useCallback(
    async (sessionKeys: Address[]) => {
      if (
        !sessionKeyEnabled ||
        scaAddress == null ||
        !provider.isConnected<MSCA>()
      ) {
        return;
      }
      const sessionKeyEnabledProvider = provider.extend(
        SessionKeyPlugin.providerMethods
      );
      const currentSessionKeys = await provider.account
        .extend(SessionKeyPlugin.accountMethods)
        .readGetSessionKeys();
      console.log(
        "updateSessionKeys: current session keys removed",
        currentSessionKeys
      );

      const findPredecessorPromises = sessionKeys.map((key) =>
        SessionKeyPlugin.findPredecessor(scaAddress, key)
      );

      sessionKeyEnabledProvider.updateSessionKeys({
        args: [
          sessionKeys,
          currentSessionKeys.map((key) => [key as Address, "0x" as Hex]),
        ],
      });
      return await (
        provider.account as MSCA & IAccountLoupe
      ).getInstalledPlugins();
    },
    [provider, scaAddress, sessionKeyEnabled]
  );

  return {
    sessionKey,
    sessionKeySigner,
    updateSessionKeys,
    createSessionKeySigner,
  };
};
