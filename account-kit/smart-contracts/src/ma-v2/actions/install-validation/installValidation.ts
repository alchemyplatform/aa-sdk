import {
  AccountNotFoundError,
  EntityIdOverrideError,
  type GetAccountParameter,
  type GetEntryPointFromAccount,
  IncompatibleClientError,
  type SendUserOperationResult,
  type UserOperationOverridesParameter,
  isSmartAccountClient,
  isSmartAccountWithSigner,
} from "@aa-sdk/core";
import {
  type Address,
  type Chain,
  type Client,
  type Hex,
  type Transport,
  concatHex,
  encodeFunctionData,
  zeroAddress,
} from "viem";

import { semiModularAccountBytecodeAbi } from "../../abis/semiModularAccountBytecodeAbi.js";
import type { HookConfig, ValidationConfig } from "../common/types.js";
import {
  serializeHookConfig,
  serializeModuleEntity,
  serializeValidationConfig,
} from "../common/utils.js";

import {
  type ModularAccountsV2,
  isModularAccountV2,
} from "../../account/common/modularAccountV2Base.js";
import { DEFAULT_OWNER_ENTITY_ID } from "../../utils.js";

export type InstallValidationParams<
  TAccount extends ModularAccountsV2 | undefined =
    | ModularAccountsV2
    | undefined,
> = {
  validationConfig: ValidationConfig;
  selectors: Hex[];
  installData: Hex;
  hooks: {
    hookConfig: HookConfig;
    initData: Hex;
  }[];
} & UserOperationOverridesParameter<GetEntryPointFromAccount<TAccount>> &
  GetAccountParameter<TAccount>;

export type UninstallValidationParams<
  TAccount extends ModularAccountsV2 | undefined =
    | ModularAccountsV2
    | undefined,
> = {
  moduleAddress: Address;
  entityId: number;
  uninstallData: Hex;
  hookUninstallDatas: Hex[];
} & UserOperationOverridesParameter<GetEntryPointFromAccount<TAccount>> &
  GetAccountParameter<TAccount>;

export type InstallValidationActions<
  TAccount extends ModularAccountsV2 | undefined =
    | ModularAccountsV2
    | undefined,
> = {
  installValidation: (
    args: InstallValidationParams<TAccount>,
  ) => Promise<SendUserOperationResult>;
  encodeInstallValidation: (
    // TODO: omit the user op sending related parameters from this type
    args: InstallValidationParams<TAccount>,
  ) => Promise<Hex>;
  uninstallValidation: (
    args: UninstallValidationParams<TAccount>,
  ) => Promise<SendUserOperationResult>;
  encodeUninstallValidation: (
    args: UninstallValidationParams<TAccount>,
  ) => Promise<Hex>;
};

/**
 * Provides validation installation and uninstallation functionalities for a MA v2 client, ensuring compatibility with `SmartAccountClient`.
 *
 * @example
 * ```ts
 * import { createModularAccountV2Client, installValidationActions, getDefaultSingleSignerValidationModuleAddress, SingleSignerValidationModule } from "@account-kit/smart-contracts";
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
  TAccount extends ModularAccountsV2 | undefined =
    | ModularAccountsV2
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): InstallValidationActions<TAccount> {
  const encodeInstallValidation = async ({
    validationConfig,
    selectors,
    installData,
    hooks,
    account = client.account,
  }: InstallValidationParams<TAccount>) => {
    if (!account || !isModularAccountV2(account)) {
      throw new AccountNotFoundError();
    }

    if (isSmartAccountWithSigner(account)) {
      if (!isSmartAccountClient(client)) {
        // if we don't differentiate between WebauthnModularAccountV2Client and ModularAccountV2Client, passing client to isSmartAccountClient complains
        throw new IncompatibleClientError(
          "SmartAccountClient",
          "installValidation",
          client,
        );
      }
    }

    // an entityId of zero is only allowed if we're installing or uninstalling hooks on the fallback validation
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

  const encodeUninstallValidation = async ({
    moduleAddress,
    entityId,
    uninstallData,
    hookUninstallDatas,
    account = client.account,
  }: UninstallValidationParams<TAccount>) => {
    if (!account || !isModularAccountV2(account)) {
      throw new AccountNotFoundError();
    }

    if (isSmartAccountWithSigner(account)) {
      if (!isSmartAccountClient(client)) {
        throw new IncompatibleClientError(
          "SmartAccountClient",
          "installValidation",
          client,
        );
      }
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
    installValidation: async ({
      validationConfig,
      selectors,
      installData,
      hooks,
      account = client.account,
      overrides,
    }: InstallValidationParams<TAccount>) => {
      if (!isSmartAccountClient(client)) {
        throw new IncompatibleClientError(
          "SmartAccountClient",
          "installValidation",
          client,
        );
      }

      if (!account) {
        throw new AccountNotFoundError();
      }

      const callData = await encodeInstallValidation({
        validationConfig,
        selectors,
        installData,
        hooks,
        account,
      });

      return client.sendUserOperation({
        uo: callData,
        account,
        overrides,
      });
    },

    uninstallValidation: async ({
      moduleAddress,
      entityId,
      uninstallData,
      hookUninstallDatas,
      account = client.account,
      overrides,
    }: UninstallValidationParams<TAccount>) => {
      if (!account) {
        throw new AccountNotFoundError();
      }

      if (!isSmartAccountClient(client)) {
        throw new IncompatibleClientError(
          "SmartAccountClient",
          "uninstallValidation",
          client,
        );
      }

      const callData: Hex = await encodeUninstallValidation({
        moduleAddress,
        entityId,
        uninstallData,
        hookUninstallDatas,
        account,
      });

      return client.sendUserOperation({
        uo: callData,
        account,
        overrides,
      });
    },
  };
}
