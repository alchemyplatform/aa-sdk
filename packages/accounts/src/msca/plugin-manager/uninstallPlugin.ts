import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetEntryPointFromAccount,
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
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  pluginAddress: Address;
  config?: Hash;
  pluginUninstallData?: Hash;
} & UserOperationOverridesParameter<TEntryPointVersion> &
  GetAccountParameter<TAccount>;

export async function uninstallPlugin<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: UninstallPluginParams<TAccount>
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

export async function encodeUninstallPluginUserOperation(
  params: Omit<UninstallPluginParams, "account" | "overrides">
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
