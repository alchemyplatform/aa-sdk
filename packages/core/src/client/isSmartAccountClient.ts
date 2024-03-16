import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../account/smartContractAccount";
import type { EntryPointVersion } from "../entrypoint/types";
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
 * @returns
 */
export function isSmartAccountClient<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
): client is SmartAccountClient<
  TEntryPointVersion,
  TTransport,
  TChain,
  TAccount
> {
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
 * @returns
 */
export function isBaseSmartAccountClient<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
): client is BaseSmartAccountClient<
  TEntryPointVersion,
  TTransport,
  TChain,
  TAccount
> {
  return client && "middleware" in client;
}
