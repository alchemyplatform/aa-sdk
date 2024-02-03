import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../account/smartContractAccount";
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
 * @returns
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
  return (
    client && "middleware" in client && client.type === "SmartAccountClient"
  );
}

/**
 * Use this method to assert that a client is a BaseSmartAccountClient.
 * Useful for narrowing the type of the client down when used within the
 * smart account action decorators
 *
 * @param client a viem client
 * @returns
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
  return (
    client && "middleware" in client && client.type === "SmartAccountClient"
  );
}
