import type {
  GetEntryPointFromAccount,
  UserOperationOverridesParameter,
} from "@alchemy/aa-core";
import {
  AccountNotFoundError,
  type GetAccountParameter,
  type IsUndefined,
  type SendUserOperationResult,
  type SmartContractAccount,
  type UserOperationOverrides,
} from "@alchemy/aa-core";
import type { Address, Chain, Client, Hex, Transport } from "viem";
import type { GetPluginAddressParameter } from "../types.js";
import {
  SessionKeyPlugin,
  sessionKeyPluginActions as sessionKeyPluginActions_,
  type SessionKeyPluginActions as SessionKeyPluginActions_,
} from "./plugin.js";
import { buildSessionKeysToRemoveStruct } from "./utils.js";

export type SessionKeyPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = Omit<
  SessionKeyPluginActions_<TAccount>,
  | "removeSessionKey"
  | "addSessionKey"
  | "rotateSessionKey"
  | "updateKeyPermissions"
> & {
  isAccountSessionKey: (
    args: { key: Address } & GetPluginAddressParameter &
      GetAccountParameter<TAccount>
  ) => Promise<boolean>;

  getAccountSessionKeys: (
    args: GetPluginAddressParameter & GetAccountParameter<TAccount>
  ) => Promise<ReadonlyArray<Address>>;

  removeSessionKey: (
    args: { key: Address } & GetPluginAddressParameter &
      GetAccountParameter<TAccount> &
      UserOperationOverridesParameter<TEntryPointVersion>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;

  addSessionKey: (
    args: {
      key: Address;
      permissions: Hex[];
      tag: Hex;
    } & GetPluginAddressParameter &
      GetAccountParameter<TAccount> &
      UserOperationOverridesParameter<TEntryPointVersion>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;

  rotateSessionKey: (
    args: {
      oldKey: Address;
      newKey: Address;
    } & GetPluginAddressParameter &
      GetAccountParameter<TAccount> &
      UserOperationOverridesParameter<TEntryPointVersion>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;

  updateSessionKeyPermissions: (
    args: {
      key: Address;
      permissions: Hex[];
    } & GetPluginAddressParameter &
      GetAccountParameter<TAccount> &
      UserOperationOverridesParameter<TEntryPointVersion>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
} & (IsUndefined<TAccount> extends false
    ? {
        getAccountSessionKeys: (
          args?: GetPluginAddressParameter & GetAccountParameter<TAccount>
        ) => Promise<ReadonlyArray<Address>>;
      }
    : {});

export const sessionKeyPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => SessionKeyPluginActions<TAccount> = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<TTransport, TChain, TAccount>
) => {
  const {
    removeSessionKey,
    addSessionKey,
    rotateSessionKey,
    updateKeyPermissions,
    ...og
  } = sessionKeyPluginActions_<TTransport, TChain, TAccount>(client);

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

    getAccountSessionKeys: async (
      args: GetPluginAddressParameter & GetAccountParameter<TAccount>
    ) => {
      const account = args?.account ?? client.account;
      if (!account) throw new AccountNotFoundError();

      const contract = SessionKeyPlugin.getContract(
        client,
        args?.pluginAddress
      );

      return await contract.read.sessionKeysOf([account.address]);
    },

    removeSessionKey: async ({
      key,
      overrides,
      account = client.account,
      pluginAddress,
    }) => {
      if (!account) throw new AccountNotFoundError();

      const sessionKeysToRemove = await buildSessionKeysToRemoveStruct(client, {
        keys: [key],
        account,
        pluginAddress,
      });

      return removeSessionKey({
        args: [key, sessionKeysToRemove[0].predecessor],
        overrides: overrides as UserOperationOverrides<TEntryPointVersion>,
        account,
      });
    },

    addSessionKey: async ({
      key,
      tag,
      permissions,
      overrides,
      pluginAddress,
      account = client.account,
    }) => {
      if (!account) throw new AccountNotFoundError();

      return addSessionKey({
        args: [key, tag, permissions],
        overrides: overrides as UserOperationOverrides<TEntryPointVersion>,
        account,
        pluginAddress,
      });
    },

    rotateSessionKey: async ({
      newKey,
      oldKey,
      overrides,
      pluginAddress,
      account = client.account,
    }) => {
      if (!account) throw new AccountNotFoundError();

      const contract = SessionKeyPlugin.getContract(client, pluginAddress);

      const predecessor = await contract.read.findPredecessor([
        account.address,
        oldKey,
      ]);

      return rotateSessionKey({
        args: [oldKey, predecessor, newKey],
        overrides: overrides as UserOperationOverrides<TEntryPointVersion>,
        account,
        pluginAddress,
      });
    },

    updateSessionKeyPermissions: async ({
      key,
      permissions,
      overrides,
      pluginAddress,
      account = client.account,
    }) => {
      if (!account) throw new AccountNotFoundError();

      return updateKeyPermissions({
        args: [key, permissions],
        overrides: overrides as UserOperationOverrides<
          GetEntryPointFromAccount<TAccount>
        >,
        account,
        pluginAddress,
      });
    },
  };
};
