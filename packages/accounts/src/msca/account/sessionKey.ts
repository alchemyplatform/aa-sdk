import {
  createBundlerClient,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { encodeFunctionData, type Address, type Transport } from "viem";
import {
  SessionKeyPlugin,
  SessionKeyPluginExecutionFunctionAbi,
} from "../plugins/session-key/plugin.js";
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
    const client = createBundlerClient({
      transport: config.transport,
      chain: config.chain,
    });
    const contract = SessionKeyPlugin.getContract(client, pluginAddress);

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

  const encodeExecuteWithFallback: SmartContractAccount["encodeExecute"] =
    async ({ target, data, value }) => {
      if (!isSessionKeyActive()) {
        return withSessionKey.encodeExecute({ target, data, value });
      }

      return encodeFunctionData({
        abi: SessionKeyPluginExecutionFunctionAbi,
        functionName: "executeWithSessionKey",
        args: [
          [{ target, data, value: value ?? 0n }],
          await sessionKeySigner.getAddress(),
        ],
      });
    };

  const encodeBatchExecuteWithFallback: SmartContractAccount["encodeBatchExecute"] =
    async (txs) => {
      if (!isSessionKeyActive()) {
        return withSessionKey.encodeBatchExecute(txs);
      }

      return encodeFunctionData({
        abi: SessionKeyPluginExecutionFunctionAbi,
        functionName: "executeWithSessionKey",
        args: [
          txs.map((x) => ({ ...x, value: x.value ?? 0n })),
          await sessionKeySigner.getAddress(),
        ],
      });
    };

  return {
    ...withSessionKey,
    source: "SessionKeyModularAccount",
    isSessionKeyActive,
    encodeExecute: encodeExecuteWithFallback,
    encodeBatchExecute: encodeBatchExecuteWithFallback,
  };
}
