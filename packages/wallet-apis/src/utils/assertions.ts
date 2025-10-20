import type { Client, Address } from "viem";
import type { SmartWalletActions } from "../decorators/smartWalletActions.js";
import type { BaseWalletClient, SignerClient } from "../types.js";
import { BaseError } from "@alchemy/common";

/**
 * Type guard function to check if a client is an Alchemy Smart Wallet Client.
 *
 * @template TAccount - The account type, either Address or undefined
 * @param {Client} client - The client to check
 * @returns {boolean} True if the client is an Alchemy Smart Wallet Client
 */
export function isSmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
>(client: Client): client is BaseWalletClient<SmartWalletActions<TAccount>> {
  return client.name === "alchemySmartWalletClient";
}

/**
 * Assertion function that throws an error if the client is not an Alchemy Smart Wallet Client.
 * After this function returns successfully, TypeScript will narrow the client type.
 *
 * @template TAccount - The account type, either Address or undefined
 * @param {Client} client - The client to assert
 * @param {string} message - Custom error message if assertion fails
 * @throws {Error} Throws an error if the client is not an Alchemy Smart Wallet Client
 */
export function assertSmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
>(
  client: Client,
  message = "Expected an Alchemy Smart Wallet Client",
): asserts client is BaseWalletClient<SmartWalletActions<TAccount>> & {
  signerClient: SignerClient;
} {
  if (!isSmartWalletClient(client)) {
    throw new BaseError(message);
  }
}
