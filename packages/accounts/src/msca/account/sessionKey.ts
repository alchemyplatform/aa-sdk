import { type SmartAccountSigner } from "@alchemy/aa-core";
import { type Address, type Transport } from "viem";
import { multiOwnerMessageSigner } from "../plugins/multi-owner/signer.js";
import { SessionKeyPlugin } from "../plugins/session-key/plugin.js";
import { SessionKeySigner } from "../plugins/session-key/signer.js";
import {
  createMultiOwnerModularAccount,
  type CreateMultiOwnerModularAccountParams,
  type MultiOwnerModularAccount,
} from "./multiOwnerAccount.js";

export type MultiOwnerSessionKeyAccount<TOwner extends SmartAccountSigner> =
  Omit<MultiOwnerModularAccount<SessionKeySigner<TOwner>>, "source"> & {
    source: "SessionKeyModularAccount";
    isSessionKeyActive: (pluginAddress?: Address) => Promise<boolean>;
  };

export type CreateMultiOwnerSessionKeyAccountParams<
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = CreateMultiOwnerModularAccountParams<TTransport, TOwner> & {
  storageType?: "local-storage" | "session-storage";
  storageKey?: string;
};

export async function createMultiOwnerModularAccountWithSessionKey<
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultiOwnerSessionKeyAccountParams<TTransport, TOwner>
): Promise<MultiOwnerSessionKeyAccount<TOwner>>;

export async function createMultiOwnerModularAccountWithSessionKey({
  storageKey,
  storageType,
  ...config
}: CreateMultiOwnerSessionKeyAccountParams) {
  const account = await createMultiOwnerModularAccount(config);

  const sessionKeySigner = new SessionKeySigner({
    fallbackSigner: account.getOwner(),
    storageKey,
    storageType,
  });

  const isSessionKeyActive = async (pluginAddress?: Address) => {
    // TODO: check if the account actually has the plugin installed
    // either via account loupe or checking if the supports interface call passes on the account
    const contract = SessionKeyPlugin.getContract(config.client, pluginAddress);

    const sessionKey = await sessionKeySigner.getAddress();

    // if this throws, then session key or the plugin is not installed
    if (
      await contract.read
        .isSessionKeyOf([account.address, sessionKey])
        .catch(() => false)
    ) {
      // TODO: Technically the key could be over its usage limit, but we'll come back to that later because
      // that requires the provider trying to validate a UO first
      return true;
    }

    return sessionKeySigner.isKeyActive();
  };

  const withSessionKey = await createMultiOwnerModularAccount({
    ...config,
    owner: sessionKeySigner,
  });

  return {
    ...withSessionKey,
    source: "SessionKeyModularAccount",
    isSessionKeyActive,
    // TODO: this is missing the correct encode* methods
    ...multiOwnerMessageSigner(
      config.client,
      account.address,
      withSessionKey.getOwner
    ),
  };
}
