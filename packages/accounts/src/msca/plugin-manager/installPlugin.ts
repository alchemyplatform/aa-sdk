import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type SmartAccountClient,
  type SmartContractAccount,
  type UserOperationOverrides,
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
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  pluginAddress: Address;
  manifestHash?: Hash;
  pluginInitData?: Hash;
  dependencies?: FunctionReference[];
} & { overrides?: UserOperationOverrides } & GetAccountParameter<TAccount>;

export async function installPlugin<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  {
    overrides,
    account = client.account,
    ...params
  }: InstallPluginParams<TAccount>
) {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError("SmartAccountClient", "installPlugin");
  }

  const callData = await encodeInstallPluginUserOperation(client, params);
  return client.sendUserOperation({ uo: callData, overrides, account });
}

export async function encodeInstallPluginUserOperation<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  params: Omit<InstallPluginParams, "overrides" | "account">
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
