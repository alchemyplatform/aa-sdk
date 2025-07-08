import type { SmartAccountSigner } from "@aa-sdk/core";
import type { Static } from "@sinclair/typebox";
import type { Address } from "abitype";
import type { wallet_createAccount } from "@alchemy/wallet-api-types/rpc";
import type { InnerWalletApiClient } from "../../types.ts";

export type CreateAccountParams = Omit<
  Extract<
    Static<typeof wallet_createAccount>["Request"]["params"][0],
    { signerAddress: Address }
  >,
  "signerAddress"
>;

export type CreateAccountResult = Static<
  typeof wallet_createAccount
>["ReturnType"];

/**
 * Creates a new account for the provided signer using the wallet API client.
 * This method is primarily used to import existing accounts.
 * For most cases, you should use requestAccount instead.
 * If the account already exists, an error will be thrown.
 *
 * @param {InnerWalletApiClient} client - The wallet API client to use for the request
 * @param {SmartAccountSigner} signer - The signer that will be associated with the account
 * @param {CreateAccountParams} params - Parameters for creating the account
 * @param {string} [params.id] - Optional UUID v4 identifier for the account
 * @param {object} params.creationOptions - Options for account creation
 * @param {string} [params.creationOptions.accountType] - Currently only "sma-b" (Modular Account v2) is supported
 * @param {string} [params.creationOptions.salt] - Optional hex string to use as salt for account creation
 * @returns {Promise<CreateAccountResult>} A Promise that resolves to the created account information
 *
 * @example
 * // Create a new account with a custom salt
 * const account = await client.createAccount({
 *   creationOptions: {
 *     accountType: "sma-b",
 *     salt: "0x04"
 *   }
 * });
 * console.log(`Created account at address: ${account.accountAddress}`);
 */
export async function createAccount(
  client: InnerWalletApiClient,
  signer: SmartAccountSigner,
  params: CreateAccountParams,
): Promise<CreateAccountResult> {
  return client.request({
    method: "wallet_createAccount",
    params: [{ signerAddress: await signer.getAddress(), ...params }],
  });
}
