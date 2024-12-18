import {
  createSmartAccountClient,
  EntityIdOverrideError,
  type SmartAccountClient,
  type SmartAccountSigner,
  type SmartAccountClientConfig,
  type UserOperationOverridesParameter,
  type GetEntryPointFromAccount,
  type SendUserOperationResult,
} from "@aa-sdk/core";
import {
  type Chain,
  type CustomTransport,
  type Transport,
  type Hex,
  type Address,
} from "viem";
import { concatHex, encodeFunctionData } from "viem";

import {
  createSMAV2Account,
  type CalldataEncoder,
  type CreateSMAV2AccountParams,
  type SMAV2Account,
} from "../account/semiModularAccountV2.js";
import type { semiModularAccountBytecodeAbi } from "../abis/semiModularAccountBytecodeAbi.js";
import type { ValidationConfig, HookConfig } from "../actions/common/types.js";
import {
  serializeValidationConfig,
  serializeHookConfig,
  serializeModuleEntity,
} from "../actions/common/utils.js";

import type { HookConfig, ValidationConfig } from "../actions/common/types.js";
import {
  serializeValidationConfig,
  serializeHookConfig,
  serializeModuleEntity,
} from "../actions/common/utils.js";

import { semiModularAccountBytecodeAbi } from "../abis/semiModularAccountBytecodeAbi.js";

export type CreateSMAV2AccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = CreateSMAV2AccountParams<TTransport, TSigner> &
  Omit<
    SmartAccountClientConfig<TTransport, TChain>,
    "transport" | "account" | "chain"
  >;

export type InstallValidationActions = {
  installValidation: (
    args: InstallValidationParams
  ) => Promise<SendUserOperationResult>;
  uninstallValidation: (
    args: UninstallValidationParams
  ) => Promise<SendUserOperationResult>;
};

export type InstallValidationParams = {
  validationConfig: ValidationConfig;
  selectors: Hex[];
  installData: Hex;
  hooks: {
    hookConfig: HookConfig;
    initData: Hex;
  }[];
} & UserOperationOverridesParameter<GetEntryPointFromAccount<SMAV2Account>>;

export type UninstallValidationParams = {
  moduleAddress: Address;
  entityId: number;
  uninstallData: Hex;
  hookUninstallDatas: Hex[];
} & UserOperationOverridesParameter<GetEntryPointFromAccount<SMAV2Account>>;

export function createSMAV2AccountClient<
  TChain extends Chain = Chain,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TCalldataEncoder extends CalldataEncoder = CalldataEncoder
>(
  args: CreateSMAV2AccountClientParams<Transport, TChain, TSigner>
): Promise<
  SmartAccountClient<CustomTransport, Chain, SMAV2Account> &
    InstallValidationActions
>;

/**
 * Creates a MAv2 account client using the provided configuration parameters.
 *
 * @example
 * ```ts
 * import { http } from "viem";
 * import { createSMAV2AccountClient } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "@account-kit/infra";
 *
 * const MNEMONIC = "...";
 * const RPC_URL = "...";
 *
 * const signer = LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);
 *
 * const chain = sepolia;
 *
 * const transport = http(RPC_URL);
 *
 * const SMAV2SignerAccountClient = await createSMAV2AccountClient({
 *  chain,
 *  signer,
 *  transport,
 * });
 * ```
 *
 * @param {CreateSMAV2AccountClientParams} config The configuration parameters required to create the MAv2 account client
 * @returns {Promise<SmartAccountClient>} A promise that resolves to a `SmartAccountClient` instance
 */
export async function createSMAV2AccountClient({
  ...config
}: CreateSMAV2AccountClientParams): Promise<
  SmartAccountClient & InstallValidationActions
> {
  const maV2Account = await createSMAV2Account({
    ...config,
  });

  const client = createSmartAccountClient({
    ...config,
    account: maV2Account,
  });

  const installValidation = async ({
    validationConfig,
    selectors,
    installData,
    hooks,
    overrides,
  }: InstallValidationParams) => {
    if (validationConfig.entityId === 0) {
      throw new EntityIdOverrideError();
    }

    const callData = await maV2Account.encodeCallData(
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
      ...maV2Account,
      overrides,
    });
  };

  const uninstallValidation = async ({
    moduleAddress,
    entityId,
    uninstallData,
    hookUninstallDatas,
    overrides,
  }: UninstallValidationParams) => {
    const callData = await maV2Account.encodeCallData(
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
      ...maV2Account,
      overrides,
    });
  };

  return {
    ...client,
    installValidation,
    uninstallValidation,
  };
}
