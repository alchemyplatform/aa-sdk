import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  EntityIdOverrideError,
  type GetEntryPointFromAccount,
  type SendUserOperationResult,
  type UserOperationOverridesParameter,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  type Address,
  type Hex,
  encodeFunctionData,
  concatHex,
  zeroAddress,
} from "viem";

import { semiModularAccountBytecodeAbi } from "../../abis/semiModularAccountBytecodeAbi.js";
import type { HookConfig, ValidationConfig } from "../common/types.js";
import {
  serializeValidationConfig,
  serializeHookConfig,
  serializeModuleEntity,
} from "../common/utils.js";

import { type SMAV2AccountClient } from "../../client/client.js";
import { type MAV2Account } from "../../account/semiModularAccountV2.js";
import { DEFAULT_OWNER_ENTITY_ID } from "../../utils.js";

export type InstallValidationParams<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  validationConfig: ValidationConfig;
  selectors: Hex[];
  installData: Hex;
  hooks: {
    hookConfig: HookConfig;
    initData: Hex;
  }[];
  account?: MAV2Account<TSigner> | undefined;
} & UserOperationOverridesParameter<
  GetEntryPointFromAccount<MAV2Account<TSigner>>
>;

export type UninstallValidationParams<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  moduleAddress: Address;
  entityId: number;
  uninstallData: Hex;
  hookUninstallDatas: Hex[];
  account?: MAV2Account<TSigner> | undefined;
} & UserOperationOverridesParameter<
  GetEntryPointFromAccount<MAV2Account<TSigner>>
>;

export type InstallValidationActions<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  installValidation: (
    args: InstallValidationParams<TSigner>
  ) => Promise<SendUserOperationResult>;
  uninstallValidation: (
    args: UninstallValidationParams<TSigner>
  ) => Promise<SendUserOperationResult>;
};

/**
 * Provides validation installation and uninstallation functionalities for a MA v2 client, ensuring compatibility with `SmartAccountClient`.
 *
 * @example
 * ```ts
 * import { createSMAV2AccountClient, installValidationActions, getDefaultSingleSignerValidationModuleAddress, SingleSignerValidationModule } from "@account-kit/smart-contracts";
 * import { Address } from "viem";
 *
 * const client = (await createSMAV2AccountClient({ ... })).extend(installValidationActions);
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
export const installValidationActions: <
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  client: SMAV2AccountClient<TSigner>
) => InstallValidationActions<TSigner> = (client) => ({
  installValidation: async ({
    validationConfig,
    selectors,
    installData,
    hooks,
    account = client.account,
    overrides,
  }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "installValidation",
        client
      );
    }

    // an entityId of zero is only allowed if we're installing or uninstalling hooks on the fallback validation
    if (
      validationConfig.entityId === DEFAULT_OWNER_ENTITY_ID &&
      validationConfig.moduleAddress !== zeroAddress
    ) {
      throw new EntityIdOverrideError();
    }

    const { encodeCallData } = account;

    const callData = await encodeCallData(
      encodeFunctionData({
        abi: semiModularAccountBytecodeAbi,
        functionName: "installValidation",
        args: [
          serializeValidationConfig(validationConfig),
          selectors,
          installData,
          hooks.map((hook: { hookConfig: HookConfig; initData: Hex }) =>
            concatHex([serializeHookConfig(hook.hookConfig), hook.initData])
          ),
        ],
      })
    );

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
  }) => {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "uninstallValidation",
        client
      );
    }

    const { encodeCallData } = account;

    const callData = await encodeCallData(
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
      })
    );

    return client.sendUserOperation({
      uo: callData,
      account,
      overrides,
    });
  },
});
