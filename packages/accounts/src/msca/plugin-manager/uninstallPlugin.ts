import {
  AccountNotFoundError,
  IncompatibleClientError,
  isSmartAccountClient,
  type GetAccountParameter,
  type GetContextParameter,
  type SmartContractAccount,
  type UserOperationOverrides,
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
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
> = {
  pluginAddress: Address;
  config?: Hash;
  pluginUninstallData?: Hash;
} & { overrides?: UserOperationOverrides } & GetAccountParameter<TAccount> &
  GetContextParameter<TContext>;

/**
 *
 * @param client
 * @param root0
 * @param root0.overrides
 * @param root0.account
 * @returns
 */
export async function uninstallPlugin<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends Record<string, any> | undefined =
    | Record<string, any>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  {
    overrides,
    account = client.account,
    ...params
  }: UninstallPluginParams<TAccount, TContext>
) {
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
  return client.sendUserOperation({ uo: callData, overrides, account });
}

/**
 *
 * @param params
 * @returns
 */
export async function encodeUninstallPluginUserOperation(
  params: Omit<UninstallPluginParams, "account" | "overrides" | "context">
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
