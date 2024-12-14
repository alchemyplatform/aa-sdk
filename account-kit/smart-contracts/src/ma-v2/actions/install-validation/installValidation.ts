import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  EntityIdOverrideError,
  type GetAccountParameter,
  type GetEntryPointFromAccount,
  type SendUserOperationResult,
  type SmartContractAccount,
  type SmartAccountClient,
  type UserOperationOverridesParameter,
} from "@aa-sdk/core";
import {
  type Address,
  type Hex,
  type Chain,
  type Transport,
  encodeFunctionData,
  concatHex,
} from "viem";

import { semiModularAccountBytecodeAbi } from "../../abis/semiModularAccountBytecodeAbi.js";
import type { HookConfig, ValidationConfig } from "../common/types.js";
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
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  moduleAddress: Address;
  entityId: number;
  uninstallData: Hex;
  hookUninstallDatas: Hex[];
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

export const installValidationActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount = SmartContractAccount
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>
) => InstallValidationActions<TAccount> = (client) => ({
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

    if (validationConfig.entityId === 0) {
      throw new EntityIdOverrideError();
    }

    const callData = encodeFunctionData({
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

    const callData = encodeFunctionData({
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
    });

    return client.sendUserOperation({
      uo: callData,
      account,
      overrides,
    });
  },
});
