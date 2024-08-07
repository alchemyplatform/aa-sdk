import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetEntryPointFromAccount,
  type SendUserOperationResult,
  type SmartContractAccount,
  type UserOperationOverridesParameter,
} from "@aa-sdk/core";
import {
  type Address,
  type Hex,
  type Chain,
  type Client,
  type Transport,
  encodeFunctionData,
  concatHex,
} from "viem";

import { UpgradeableModularAccountAbi } from "../../abis/UpgradeableModularAccount.js";
import type { ValidationConfig, HookConfig } from "../common/types.js";
import {
  serializeValidationConfig,
  serializeHookConfig,
  serializeModuleEntity,
} from "../common/utils.js";

export type InstallValidationParams<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  args: {
    validationConfig: ValidationConfig;
    selectors: Hex[];
    installData: Hex;
    hooks: {
      hookConfig: HookConfig;
      initData: Hex;
    }[];
  };
} & UserOperationOverridesParameter<GetEntryPointFromAccount<TAccount>> &
  GetAccountParameter<TAccount>;

export type UninstallValidationParams<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  args: {
    moduleAddress: Address;
    entityId: number;
    uninstallData: Hex;
    hookUninstallDatas: Hex[];
  };
} & UserOperationOverridesParameter<GetEntryPointFromAccount<TAccount>> &
  GetAccountParameter<TAccount>;

export type InstallValidationActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  installValidation: (
    args: InstallValidationParams<TAccount>
  ) => Promise<SendUserOperationResult>;
  uninstallValidation: (
    args: UninstallValidationParams<TAccount>
  ) => Promise<SendUserOperationResult>;
};

/**
 * The client object containing methods to install and uninstall validation configurations.
 *
 * @example
 * ```ts
 * import { createSingleSignerRIAccountClient, installValidationActions, SingleSignerValidationModule } from "@account-kit/smart-contracts";
 *
 * const accountClient = createSingleSignerRIAccountClient({
 *    chain,
 *    signer,
 *    accountAddress,
 *    transport,
 *  }).extend(installValidationActions);
 *
 * const secondarySigner = new LocalAccountSigner(privateKeyToAccount(keccak256(toHex("secondarySigner"))));
 *
 * const result = accountClient.installValidation({
 *      args: {
 *          validationConfig: {
 *              moduleAddress: SingleSignerValidationModule.meta.addresses.default,
 *              entityId,
 *              isGlobal: true,
 *              isSignatureValidation: true,
 *          },
 *          selectors: [],
 *          installData: SingleSignerValidationModule.encodeOnInstallData(entityId, await secondarySigner.getAddress()),
 *          hooks: [],
 *      }});
 *
 * ```
 *
 * @param {object} client The client object for the SmartAccount.
 * @returns {object} An object containing two methods: `installValidation` and `uninstallValidation`.
 */
export const installValidationActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => InstallValidationActions<TAccount> = (client) => ({
  installValidation: async ({ args, account = client.account, overrides }) => {
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

    const { validationConfig, selectors, installData, hooks } = args;

    const callData = encodeFunctionData({
      abi: UpgradeableModularAccountAbi,
      functionName: "installValidation",
      args: [
        serializeValidationConfig(validationConfig),
        selectors,
        installData,
        hooks.map((hook) =>
          concatHex([serializeHookConfig(hook.hookConfig), hook.initData])
        ),
      ],
    });

    return client.sendUserOperation({
      uo: callData,
      account,
      overrides,
    });
  },

  uninstallValidation: async ({
    args,
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

    const { moduleAddress, entityId, uninstallData, hookUninstallDatas } = args;

    const callData = encodeFunctionData({
      abi: UpgradeableModularAccountAbi,
      functionName: "uninstallValidation",
      args: [
        serializeModuleEntity({
          moduleAddress,
          entityId,
        }),
        uninstallData,
        hookUninstallDatas,
      ],
    });

    return client.sendUserOperation({
      uo: callData,
      account,
      overrides,
    });
  },
});
