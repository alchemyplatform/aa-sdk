import { isSmartAccountClient, type SmartContractAccount } from "@aa-sdk/core";
import type { Chain, Client, Transport } from "viem";
import type { AlchemySmartAccountClient } from "./smartAccountClient";

/**
 * Checks if a given client is an Alchemy Smart Account Client. The goal of this check is to ensure that the client supports certain RPC methods.
 *
 * @example
 * ```ts
 * import { isAlchemySmartAccountClient } from "@account-kit/infra";
 *
 * if (isAlchemySmartAccountClient(client)) {
 *  // do things with the client as an Alchemy Smart Account Client
 * }
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance to be checked
 * @returns {boolean} `true` if the client is an Alchemy Smart Account Client, otherwise `false`
 */
export function isAlchemySmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
): client is AlchemySmartAccountClient<TTransport, TChain, TAccount> {
  // TODO: the goal of this check is to make sure that the client supports certain RPC methods
  // we should probably do this by checking the client's transport and configured URL, since alchemy
  // clients have to be RPC clients. this is difficult to do though because the transport might
  // point to a proxy url :/
  return isSmartAccountClient(client);
}
