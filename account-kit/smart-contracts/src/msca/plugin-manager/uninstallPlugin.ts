import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetContextParameter,
  type GetEntryPointFromAccount,
  type SmartContractAccount,
  type UserOperationContext,
  type UserOperationOverridesParameter,
} from "@aa-sdk/core";
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
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
> = {
  pluginAddress: Address;
  config?: Hash;
  pluginUninstallData?: Hash;
} & UserOperationOverridesParameter<TEntryPointVersion> &
  GetAccountParameter<TAccount> &
  GetContextParameter<TContext>;

export async function uninstallPlugin<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
  {
    overrides,
    account = client.account,
    context,
    ...params
  }: UninstallPluginParams<TAccount, TContext>,
) {
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "SmartAccountClient",
      "uninstallPlugin",
      client,
    );
  }

  const callData = await encodeUninstallPluginUserOperation(params);

  return client.sendUserOperation({
    uo: callData,
    overrides,
    account,
    context,
  });
}

export async function encodeUninstallPluginUserOperation(
  params: Omit<UninstallPluginParams, "account" | "overrides" | "context">,
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
