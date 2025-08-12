import {
  type Address,
  type Client,
  type Hex,
  type IsUndefined,
  type Chain,
  type Transport,
  zeroAddress,
  concatHex,
  encodeFunctionData,
} from "viem";
import type { HookConfig, ValidationConfig } from "../types";
import type { ModularAccountV2 } from "../accounts/account";
import type { GetAccountParameter } from "../../types";
import { semiModularAccountBytecodeAbi } from "../abis/semiModularAccountBytecodeAbi.js";
import { type SmartAccount, sendUserOperation } from "viem/account-abstraction";
import { getAction } from "viem/utils";
import { AccountNotFoundError } from "@alchemy/common";
import { EntityIdOverrideError } from "../../errors/EntityIdOverrideError.js";
import {
  serializeHookConfig,
  serializeValidationConfig,
} from "../utils/hooks.js";
import {
  DEFAULT_OWNER_ENTITY_ID,
  isModularAccountV2,
  serializeModuleEntity,
} from "../utils/account.js";

export type InstallValidationParams<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
> = {
  validationConfig: ValidationConfig;
  selectors: Hex[];
  installData: Hex;
  hooks: {
    hookConfig: HookConfig;
    initData: Hex;
  }[];
} & GetAccountParameter<TAccount, ModularAccountV2>;

export type UninstallValidationParams<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
> = {
  moduleAddress: Address;
  entityId: number;
  uninstallData: Hex;
  hookUninstallDatas: Hex[];
} & GetAccountParameter<TAccount, ModularAccountV2>;

export type InstallValidationActions<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
> = {
  encodeInstallValidation: (
    args: InstallValidationParams<TAccount>,
  ) => Promise<Hex>;
  installValidation: (args: InstallValidationParams<TAccount>) => Promise<Hex>;
  encodeUninstallValidation: (
    args: UninstallValidationParams<TAccount>,
  ) => Promise<Hex>;
  uninstallValidation: (
    args: UninstallValidationParams<TAccount>,
  ) => Promise<Hex>;
};

// TODO(v5): update jsdoc
/**
 * Provides validation installation and uninstallation functionalities for a MA v2 client, ensuring compatibility with `SmartAccountClient`.
 *
 * @example
 * ```ts
 * import { createModularAccountV2Client, installValidationActions, getDefaultSingleSignerValidationModuleAddress, SingleSignerValidationModule } from "@alchemy/smart-accounts";
 * import { Address } from "viem";
 *
 * const client = (await createModularAccountV2Client({ ... })).extend(installValidationActions);
 * const sessionKeyAddress: Address = "0x1234";
 * const sessionKeyEntityId: number = 1;
 *
 * await client.installValidation({
 *   validationConfig: {
 *     moduleAddress: getDefaultSingleSignerValidationModuleAddress(
 *       client.chain
 *     ),
 *     entityId: sessionKeyEntityId,
 *     isGlobal: true,
 *     isSignatureValidation: false,
 *     isUserOpValidation: true,
 *   },
 *   selectors: [],
 *   installData: SingleSignerValidationModule.encodeOnInstallData({
 *     entityId: sessionKeyEntityId,
 *     signer: sessionKeyAddress,
 *   }),
 *   hooks: [],
 * });
 *
 * await client.uninstallValidation({
 *   moduleAddress: sessionKeyAddress,
 *   entityId: sessionKeyEntityId,
 *   uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
 *     entityId: sessionKeyEntityId,
 *   }),
 *   hookUninstallDatas: [],
 * });
 *
 * ```
 *
 * @param {object} client - The client instance which provides account and sendUserOperation functionality.
 * @returns {object} - An object containing two methods, `installValidation` and `uninstallValidation`.
 */
export function installValidationActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): InstallValidationActions<
  IsUndefined<TAccount> extends true ? undefined : ModularAccountV2
> {
  const encodeInstallValidation = async (
    args: InstallValidationParams<
      IsUndefined<TAccount> extends true ? undefined : ModularAccountV2
    >,
  ) => {
    const {
      validationConfig,
      selectors,
      installData,
      hooks,
      account = client.account,
    } = args;

    if (!account || !isModularAccountV2(account)) {
      throw new AccountNotFoundError();
    }

    // An entityId of zero is only allowed if we're installing or uninstalling hooks on the fallback validation.
    if (
      validationConfig.entityId === DEFAULT_OWNER_ENTITY_ID &&
      validationConfig.moduleAddress !== zeroAddress
    ) {
      throw new EntityIdOverrideError();
    }

    return account.encodeCallData(
      encodeFunctionData({
        abi: semiModularAccountBytecodeAbi,
        functionName: "installValidation",
        args: [
          serializeValidationConfig(validationConfig),
          selectors,
          installData,
          hooks.map((hook: { hookConfig: HookConfig; initData: Hex }) =>
            concatHex([serializeHookConfig(hook.hookConfig), hook.initData]),
          ),
        ],
      }),
    );
  };

  const encodeUninstallValidation = async (
    args: UninstallValidationParams<
      IsUndefined<TAccount> extends true ? undefined : ModularAccountV2
    >,
  ) => {
    const {
      moduleAddress,
      entityId,
      uninstallData,
      hookUninstallDatas,
      account = client.account,
    } = args;

    if (!account || !isModularAccountV2(account)) {
      throw new AccountNotFoundError();
    }

    return account.encodeCallData(
      encodeFunctionData({
        abi: semiModularAccountBytecodeAbi,
        functionName: "uninstallValidation",
        args: [
          serializeModuleEntity({
            moduleAddress,
            entityId,
          }),
          uninstallData,
          hookUninstallDatas,
        ],
      }),
    );
  };

  return {
    encodeInstallValidation,
    encodeUninstallValidation,
    installValidation: async (args) => {
      const {
        validationConfig,
        selectors,
        installData,
        hooks,
        account = client.account,
      } = args;

      if (!account || !isModularAccountV2(account)) {
        throw new AccountNotFoundError();
      }

      const callData = await encodeInstallValidation({
        validationConfig,
        selectors,
        installData,
        hooks,
        account,
      });

      const action = getAction(client, sendUserOperation, "sendUserOperation");
      const result = await action({
        callData,
        account,
      });

      return result;
    },

    uninstallValidation: async (args) => {
      const {
        moduleAddress,
        entityId,
        uninstallData,
        hookUninstallDatas,
        account = client.account,
      } = args;

      if (!account || !isModularAccountV2(account)) {
        throw new AccountNotFoundError();
      }

      const callData = await encodeUninstallValidation({
        moduleAddress,
        entityId,
        uninstallData,
        hookUninstallDatas,
        account,
      });

      const action = getAction(client, sendUserOperation, "sendUserOperation");
      const result = await action({
        callData,
        account,
      });

      return result;
    },
  };
}
