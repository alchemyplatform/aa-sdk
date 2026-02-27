import type { Client, LocalAccount } from "viem";
import type { InnerWalletApiClient, SignerClient } from "../types.js";
import { BaseError } from "@alchemy/common";

/**
 * Type guard function to check if a client is an Alchemy Smart Wallet Client.
 *
 * @param {Client} client - The client to check
 * @returns {boolean} True if the client is an Alchemy Smart Wallet Client
 */
export function isSmartWalletClient(
  client: Client,
): client is InnerWalletApiClient {
  return client.name === "alchemySmartWalletClient" && "owner" in client;
}

/**
 * Assertion function that throws an error if the client is not an Alchemy Smart Wallet Client.
 * After this function returns successfully, TypeScript will narrow the client type.
 *
 * @param {Client} client - The client to assert
 * @param {string} message - Custom error message if assertion fails
 * @throws {Error} Throws an error if the client is not an Alchemy Smart Wallet Client
 */
export function assertSmartWalletClient(
  client: Client,
  message = "Expected an Alchemy Smart Wallet Client",
): asserts client is InnerWalletApiClient {
  if (!isSmartWalletClient(client)) {
    throw new BaseError(message);
  }
}

export function isLocalAccount(
  signer: LocalAccount | SignerClient,
): signer is LocalAccount {
  return signer.type === "local";
}

export function isSignerClient(
  signer: LocalAccount | SignerClient,
): signer is SignerClient {
  return "request" in signer;
}
