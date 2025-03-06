import type {
  GetEntryPointFromAccount,
  UserOperationOverridesParameter,
} from "@aa-sdk/core";
import {
  AccountNotFoundError,
  isSmartAccountClient,
  type GetAccountParameter,
  type IsUndefined,
  type SendUserOperationResult,
  type SmartContractAccount,
  type UserOperationOverrides,
} from "@aa-sdk/core";
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

/**
 * Creates actions for managing session keys in a smart contract associated with a client, including adding, removing, rotating, and updating session key permissions.
 *
 * @example
 * ```ts
 * import { createModularAccountAlchemyClient, sessionKeyPluginActions } from "@account-kit/smart-contracts";
 *
 * const client = createModularAccountAlchemyClient(...).extend(sessionKeyPluginActions);
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance to use for managing session keys
 * @returns {SessionKeyPluginActions<TAccount>} An object containing methods for session key management and interaction with the smart contract
 */
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
    executeWithSessionKey,
    ...og
  } = sessionKeyPluginActions_<TTransport, TChain, TAccount>(client);

  // The session key plugin returns an opaque error when the permissions check
  // fails. We want the SDK to return a helpful error instead. After validation
  // fails, rerun the user op simulation but using state overrides to replace
  // the code of the session key plugin with a version that produces descriptive
  // errors.
  const fixedExecuteWithSessionKey: typeof executeWithSessionKey = async (
    ...originalArgs
  ) => {
    let initialError: unknown;
    try {
      return await executeWithSessionKey(...originalArgs);
    } catch (error) {
      initialError = error;
    }
    const details = getRpcErrorMessageFromViemError(initialError);
    if (!details?.includes("AA23 reverted (or OOG)")) {
      throw initialError;
    }
    if (!isSmartAccountClient(client) || !client.chain) {
      throw initialError;
    }
    const {
      args,
      overrides,
      context,
      account = client.account,
    } = originalArgs[0];
    if (!account) {
      throw initialError;
    }
    const data = og.encodeExecuteWithSessionKey({ args });
    const sessionKeyPluginAddress =
      SessionKeyPlugin.meta.addresses[client.chain.id];
    // The bytecode is 10kb of hex. Only import it if needed.
    const { DEBUG_SESSION_KEY_BYTECODE } = await import(
      "./debug-session-key-bytecode.js"
    );
    const updatedOverrides: UserOperationOverrides<TEntryPointVersion> = {
      ...(overrides as UserOperationOverrides<TEntryPointVersion>),
      stateOverride: [
        ...(overrides?.stateOverride ?? []),
        {
          address: sessionKeyPluginAddress,
          code: DEBUG_SESSION_KEY_BYTECODE,
        },
      ],
    };
    try {
      await client.buildUserOperation({
        uo: data,
        overrides: updatedOverrides,
        context,
        account,
      });
      // We expect this to fail because we just saw the same user op fail a
      // moment ago. It could succeed if the state of the chain has changed but
      // there's not much we can do with a successful result so return the
      // original error.
      throw initialError;
    } catch (improvedError) {
      const details = getRpcErrorMessageFromViemError(improvedError) ?? "";
      const reason = details.match(/AA23 reverted: (.+)/)?.[1];
      if (!reason) {
        throw initialError;
      }
      throw new SessionKeyPermissionError(reason);
    }
  };

  return {
    ...og,

    executeWithSessionKey: fixedExecuteWithSessionKey,

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

function getRpcErrorMessageFromViemError(error: unknown): string | undefined {
  const details = (error as any)?.details;
  return typeof details === "string" ? details : undefined;
}

class SessionKeyPermissionError extends Error {}
