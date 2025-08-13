import {
  type Address,
  type Hex,
  type Prettify,
  type SignableMessage,
} from "viem";
import type { InnerWalletApiClient } from "../types.ts";
import { requestAccount } from "./requestAccount.js";

export type SignMessageParams = Prettify<{
  message: SignableMessage;
  account?: Address;
}>;

export type SignMessageResult = Prettify<Hex>;

/**
 * Signs a message using the smart account.
 * This method requests the account associated with the signer and uses it to sign the message.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SignMessageParams} params - Parameters for signing the message
 * @param {SignableMessage} params.message - The message to sign using EIP-191. Can be a string, or object with raw bytes.
 * @param {Address} [params.account] - Optional account address to use for signing. If not provided, uses the client's current account.
 * @returns {Promise<SignMessageResult>} A Promise that resolves to the signed message as a hex string
 *
 * @example
 * ```ts
 * // Sign a simple text message
 * const signature = await client.signMessage("Hello, world!");
 *
 * // Sign a raw hex message
 * const signature = await client.signMessage({ raw: "0x48656c6c6f2c20776f726c6421" });
 * ```
 */
export async function signMessage(
  client: InnerWalletApiClient,
  params: SignMessageParams,
): Promise<SignMessageResult> {
  const account = await requestAccount(client, {
    accountAddress: params.account ?? client.account?.address,
  });

  // TODO(jh): this needs to go through prepare & format sign on the server? this 6492 was only for signing locally w/ v4.
  return account.signMessageWith6492({ message: params.message });
}
