import {
  type Address,
  type Hex,
  type Prettify,
  type TypedDataDefinition,
} from "viem";
import type { InnerWalletApiClient } from "../types.ts";
import { requestAccount } from "./requestAccount.js";

export type SignTypedDataParams = Prettify<
  TypedDataDefinition & {
    account?: Address;
  }
>;

export type SignTypedDataResult = Prettify<Hex>;

/**
 * Signs typed data (EIP-712) using the smart account.
 * This method requests the account associated with the signer and uses it to sign the typed data.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {TypedDataDefinition} params - The typed data to sign, following EIP-712 format
 * @returns {Promise<SignTypedDataResult>} A Promise that resolves to the signature as a hex string
 *
 * @example
 * ```ts
 * // Sign typed data
 * const signature = await client.signTypedData({
 *   domain: {
 *     name: 'Example DApp',
 *     version: '1',
 *     chainId: 1,
 *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
 *   },
 *   types: {
 *     Person: [
 *       { name: 'name', type: 'string' },
 *       { name: 'wallet', type: 'address' }
 *     ]
 *   },
 *   primaryType: 'Person',
 *   message: {
 *     name: 'John Doe',
 *     wallet: '0xAaAaAaAaAaAaAaAaAaAAAAAAAAaaaAaAaAaaAaAa'
 *   }
 * });
 * ```
 */
export async function signTypedData(
  client: InnerWalletApiClient,
  params: SignTypedDataParams,
): Promise<SignTypedDataResult> {
  const account = await requestAccount(client, {
    accountAddress: params.account ?? client.account?.address,
  });

  // TODO(jh): this needs to go through prepare & format sign on the server? this 6492 was only for signing locally w/ v4.
  return account.signTypedDataWith6492(params);
}
