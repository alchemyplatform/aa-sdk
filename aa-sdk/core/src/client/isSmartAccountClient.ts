import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../account/smartContractAccount";
import { smartAccountClientMethodKeys } from "./decorators/smartAccountClient.js";
import type {
  BaseSmartAccountClient,
  SmartAccountClient,
} from "./smartAccountClient";

/**
 * Use this method to assert that a client is a BaseSmartAccountClient.
 * Useful for narrowing the type of the client down when used within the
 * smart account client decorators
 *
 * @param client a viem client
 * @returns true if the client is a SmartAccountClient
 */
export function isSmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
): client is SmartAccountClient<TTransport, TChain, TAccount> {
  for (const key of smartAccountClientMethodKeys) {
    if (!(key in client)) {
      return false;
    }
  }

  return client && "middleware" in client;
}

/**
 * Use this method to assert that a client is a BaseSmartAccountClient.
 * Useful for narrowing the type of the client down when used within the
 * smart account action decorators
 *
 * @param client a viem client
 * @returns true if the account is a BaseSmartAccountClient
 */
export function isBaseSmartAccountClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
): client is BaseSmartAccountClient<TTransport, TChain, TAccount> {
  return client && "middleware" in client;
}
