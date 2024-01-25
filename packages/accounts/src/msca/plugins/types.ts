import type {
  Abi,
  Address,
  ISmartAccountProvider,
  PublicErc4337Client,
  SupportedTransports,
} from "@alchemy/aa-core";
import type { GetContractReturnType, HttpTransport, Transport } from "viem";
import type { IMSCA } from "../types";

export interface Plugin<AD, PD, TAbi extends Abi> {
  meta: { name: string; version: string; addresses: Record<number, Address> };
  /**
   * helper functions that can be used to get contract instance of the plugin
   *
   * @param p - a provider instance to provide public client instance to fetch the contract with
   * @returns the plugin contract instance
   */
  getContract: (
    rpcClient:
      | PublicErc4337Client<HttpTransport>
      | PublicErc4337Client<Transport>,
    address?: Address
  ) => GetContractReturnType<TAbi, typeof rpcClient, undefined, Address>;
  /**
   * Decorator functions that can be used to read data from an MSCA contract instance
   * These methods can be used on their own or with the `account.extend` method to add them to the account instance
   *  @example
   * const account = new MSCA(...);
   * const extendedAccount = account.extend(plugin.accountMethods);
   * // OR
   * const accountReadMethods = plugin.accountMethods(account);
   *
   * @param a - the MSCA contract instance we want to read from
   * @returns the various read methods this plugin provides for this MSCA contract instance
   */
  accountMethods: (a: IMSCA<any, any, any>) => AD;
  /**
   *  Decorator functions that can be used to write data to an MSCA contract instance
   *
   * @example
   * const provider = new SmartAccountProvider(...).connect(rpcClient => new MSCA(...));
   * const extendedProvider = provider.extend(plugin.providerMethods);
   * // OR
   * const accountWriteMethods = plugin.providerMethods(provider);
   *
   * @param p - a provider instance connected to an MSCA that we want to send user ops to
   * @returns the various write methods this plugin provides for this MSCA contract instance
   */
  providerMethods: <
    TTransport extends SupportedTransports,
    P extends ISmartAccountProvider<TTransport> & { account: IMSCA<TTransport> }
  >(
    p: P
  ) => PD;
}
