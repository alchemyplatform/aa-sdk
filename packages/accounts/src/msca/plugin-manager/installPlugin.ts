import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type EntryPointVersion,
  type GetAccountParameter,
  type SmartAccountClient,
  type SmartContractAccount,
  type UserOperationOverridesParameter,
} from "@alchemy/aa-core";
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
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  pluginAddress: Address;
  manifestHash?: Hash;
  pluginInitData?: Hash;
  dependencies?: FunctionReference[];
} & UserOperationOverridesParameter<TEntryPointVersion> &
  GetAccountParameter<TEntryPointVersion, TAccount>;

export async function installPlugin<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: InstallPluginParams<TEntryPointVersion, TAccount>
) {
  const { overrides, account = client.account, ...params } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "installPlugin",
      client
    );
  }

  const callData = await encodeInstallPluginUserOperation(client, params);

  return client.sendUserOperation({
    uo: callData,
    overrides,
    account,
  });
}

export async function encodeInstallPluginUserOperation<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: SmartAccountClient<TEntryPointVersion, TTransport, TChain, TAccount>,
  params: Omit<InstallPluginParams<TEntryPointVersion>, "overrides" | "account">
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
      })
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
