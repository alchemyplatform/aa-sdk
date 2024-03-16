import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type EntryPointVersion,
  type GetAccountParameter,
  type SmartContractAccount,
  type UserOperationOverridesParameter,
} from "@alchemy/aa-core";
import {
  encodeFunctionData,
  type Address,
  type Chain,
  type Client,
  type Hash,
  type Transport,
} from "viem";
import { IPluginManagerAbi } from "../abis/IPluginManager.js";

export type UninstallPluginParams<
  TEntryPointVersion extends EntryPointVersion,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
> = {
  pluginAddress: Address;
  config?: Hash;
  pluginUninstallData?: Hash;
} & UserOperationOverridesParameter<TEntryPointVersion> &
  GetAccountParameter<TEntryPointVersion, TAccount>;

export async function uninstallPlugin<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: UninstallPluginParams<TEntryPointVersion, TAccount>
) {
  const { overrides, account = client.account, ...params } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "uninstallPlugin",
      client
    );
  }

  const callData = await encodeUninstallPluginUserOperation(params);

  return client.sendUserOperation({
    uo: callData,
    overrides: overrides,
    account,
  });
}

export async function encodeUninstallPluginUserOperation<
  TEntryPointVersion extends EntryPointVersion
>(
  params: Omit<
    UninstallPluginParams<TEntryPointVersion>,
    "account" | "overrides"
  >
) {
  return encodeFunctionData({
    abi: IPluginManagerAbi,
    functionName: "uninstallPlugin",
    args: [
      params.pluginAddress,
      params.config ?? "0x",
      params.pluginUninstallData ?? "0x",
    ],
  });
}
