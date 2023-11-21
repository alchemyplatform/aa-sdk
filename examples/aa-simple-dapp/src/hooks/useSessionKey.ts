import { createLocalAccount } from "@/shared/util";
import { IAccountLoupe, MSCA } from "@alchemy/aa-accounts";
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
  const [sessionKeySigner, setSessionKeySigner] =
    useState<LocalAccountSigner<PrivateKeyAccount>>();

  useAsyncEffect(async () => {
    if (
      !sessionKeyEnabled ||
      scaAddress == null ||
      !provider.isConnected<MSCA>()
    ) {
      return;
    }

    const storedSessionKey = window.localStorage.getItem(
      "msca-sessionkey"
    ) as Address;
    const storedSessionKeySecret = window.localStorage.getItem(
      "msca-sessionkey-secret"
    ) as Hex;

    if (storedSessionKey && storedSessionKeySecret) {
      const signer = LocalAccountSigner.privateKeyToAccountSigner(
        storedSessionKeySecret
      );
      setSessionKeySigner(signer);
    }
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
      // const sessionKeyEnabledProvider = provider.extend(
      //   SessionKeyPlugin.providerMethods
      // );
      // const currentSessionKeys = await provider.account
      //   .extend(SessionKeyPlugin.accountMethods)
      //   .readGetSessionKeys();
      // console.log("current session keys", currentSessionKeys);
      // sessionKeyEnabledProvider.updateSessionKeys({
      //   args: [
      //     sessionKeys,
      //     currentSessionKeys.map((key) => [key as Address, "0x" as Hex]),
      //   ],
      // });
      return await (
        provider.account as MSCA & IAccountLoupe
      ).getInstalledPlugins();
    },
    [provider, scaAddress, sessionKeyEnabled]
  );

  return {
    sessionKeySigner,
    updateSessionKeys,
    createSessionKeySigner,
  };
};
