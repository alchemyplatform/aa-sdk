import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetContextParameter,
  type GetEntryPointFromAccount,
  type SmartAccountClient,
  type SmartContractAccount,
  type UserOperationOverridesParameter,
} from "@aa-sdk/core";
import {
  encodeFunctionData,
  encodeFunctionResult,
  keccak256,
  type Address,
  type Chain,
  type Client,
  type Hash,
  type Transport,
} from "viem";
import { IPluginAbi } from "../abis/IPlugin.js";
import { IPluginManagerAbi } from "../abis/IPluginManager.js";
import type { FunctionReference } from "../account-loupe/types.js";

export type InstallPluginParams<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
> = {
  pluginAddress: Address;
  manifestHash?: Hash;
  pluginInitData?: Hash;
  dependencies?: FunctionReference[];
} & UserOperationOverridesParameter<TEntryPointVersion> &
  GetAccountParameter<TAccount> &
  GetContextParameter<TContext>;

/**
 * Installs a plugin on a smart account via the client, sending the user operation with the appropriate parameters.
 * NOTE: it's recommended to just use the installPlugin action returned from generated plugins
 *
 * @example
 * ```ts
 * import { installPlugin, createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
 *
 * const client = createModularAccountAlchemyClient(...);
 *
 * const hash = await installPlugin(client, {
 *  pluginAddress: "0x...",
 *  manifestHash: "0x...",
 *  dependencies: [], // this is defined by the plugin you're installing
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client configured to the smart account on which the plugin will be installed
 * @param {InstallPluginParams<TAccount, TContext>} params The parameters required to install the plugin, including overrides, context, and account information
 * @returns {Promise<any>} A promise that resolves once the plugin installation operation is sent
 */
export async function installPlugin<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
  {
    overrides,
    context,
    account = client.account,
    ...params
  }: InstallPluginParams<TAccount, TContext>,
) {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "installPlugin",
      client,
    );
  }

  const callData = await encodeInstallPluginUserOperation(client, params);

  return client.sendUserOperation({
    uo: callData,
    overrides,
    account,
    context,
  });
}

export async function encodeInstallPluginUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  params: Omit<InstallPluginParams, "overrides" | "account" | "context">,
) {
  const pluginManifest = await client.readContract({
    abi: IPluginAbi,
    address: params.pluginAddress,
    functionName: "pluginManifest",
  });
  // use the manifest hash passed in or get it from the plugin
  const manifestHash: Hash =
    params.manifestHash ??
    keccak256(
      encodeFunctionResult({
        abi: IPluginAbi,
        functionName: "pluginManifest",
        result: pluginManifest,
      }),
    );
  return encodeFunctionData({
    abi: IPluginManagerAbi,
    functionName: "installPlugin",
    args: [
      params.pluginAddress,
      manifestHash,
      params.pluginInitData ?? "0x",
      params.dependencies ?? [],
    ],
  });
}
