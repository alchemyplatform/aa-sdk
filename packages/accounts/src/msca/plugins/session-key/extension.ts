import {
  AccountNotFoundError,
  type GetAccountParameter,
  type SendUserOperationResult,
  type SmartAccountClient,
  type SmartContractAccount,
  type UserOperationOverrides,
} from "@alchemy/aa-core";
import type { Address, Chain, Transport } from "viem";
import {
  SessionKeyPlugin,
  sessionKeyPluginActions as sessionKeyPluginActions_,
  type SessionKeyPluginActions as SessionKeyPluginActions_,
} from "./plugin.js";
import { buildSessionKeysToRemoveStruct } from "./utils.js";

export type SessionKeyPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = Omit<SessionKeyPluginActions_<TAccount>, "removeSessionKey"> & {
  isAccountSessionKey: (
    args: {
      key: Address;
      pluginAddress?: Address;
    } & GetAccountParameter<TAccount>
  ) => Promise<boolean>;

  getAccountSessionKeys: (
    args: {
      pluginAddress?: Address;
    } & GetAccountParameter<TAccount>
  ) => Promise<ReadonlyArray<Address>>;

  removeSessionKey: (
    args: {
      key: Address;
      pluginAddress?: Address;
      overrides: UserOperationOverrides;
    } & GetAccountParameter<TAccount>
  ) => Promise<SendUserOperationResult>;
};

export const sessionKeyPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>
) => SessionKeyPluginActions<TAccount> = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>
) => {
  const { removeSessionKey, ...og } = sessionKeyPluginActions_(client);

  return {
    ...og,
    isAccountSessionKey: async ({
      key,
      pluginAddress,
      account = client.account,
    }) => {
      if (!account) throw new AccountNotFoundError();

      const contract = SessionKeyPlugin.getContract(client, pluginAddress);

      return await contract.read.isSessionKeyOf([account.address, key]);
    },

    getAccountSessionKeys: async ({
      pluginAddress,
      account = client.account,
    }) => {
      if (!account) throw new AccountNotFoundError();

      const contract = SessionKeyPlugin.getContract(client, pluginAddress);

      return await contract.read.sessionKeysOf([account.address]);
    },

    removeSessionKey: async ({ key, overrides, account = client.account }) => {
      if (!account) throw new AccountNotFoundError();

      const sessionKeysToRemove = await buildSessionKeysToRemoveStruct(client, {
        keys: [key],
        account,
      });

      return removeSessionKey({
        args: [key, sessionKeysToRemove[0].predecessor],
        overrides,
        account,
      });
    },
  };
};
