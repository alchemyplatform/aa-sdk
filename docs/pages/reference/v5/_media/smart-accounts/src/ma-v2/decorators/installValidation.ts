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
import type { HookConfig, ValidationConfig } from "../types.js";
import type { ModularAccountV2 } from "../accounts/account.js";
import type { GetAccountParameter } from "../../types.js";
import { semiModularAccountBytecodeAbi } from "../abis/semiModularAccountBytecodeAbi.js";
import type { SmartAccount } from "viem/account-abstraction";
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
  encodeUninstallValidation: (
    args: UninstallValidationParams<TAccount>,
  ) => Promise<Hex>;
};

/**
 * Provides validation installation and uninstallation encoding functionalities for a MA v2 client.
 *
 * @example
 * ```ts
 * import { installValidationActions, SingleSignerValidationModule } from "@alchemy/smart-accounts";
 * import { Address } from "viem";
 *
 * const client = (await createModularAccountV2Client({ ... })).extend(installValidationActions);
 * const sessionKeyAddress: Address = "0x1234";
 * const sessionKeyEntityId: number = 1;
 *
 * const callData = await client.encodeInstallValidation({
 *   validationConfig: {
 *     moduleAddress: getDefaultSingleSignerValidationModuleAddress(client.chain),
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
 * await client.sendUserOperation({ callData, account });
 * ```
 *
 * @param {object} client - The client instance which provides account functionality.
 * @returns {object} - An object containing `encodeInstallValidation` and `encodeUninstallValidation`.
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
  };
}
