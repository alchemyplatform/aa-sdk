import { type SmartContractAccount } from "@aa-sdk/core";
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
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
): client is AlchemySmartAccountClient<TChain, TAccount> {
  return client.transport.type === "alchemy";
}
