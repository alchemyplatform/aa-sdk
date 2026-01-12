import type { Client, LocalAccount } from "viem";
import type { InnerWalletApiClient, SignerClient } from "../types.js";
import { BaseError } from "@alchemy/common";
import type { WebAuthnAccount } from "viem/account-abstraction";

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
  signer: LocalAccount | WebAuthnAccount | SignerClient,
): signer is LocalAccount {
  return !("credential" in signer) && !("request" in signer);
}

export function isWebAuthnAccount(
  signer: LocalAccount | WebAuthnAccount | SignerClient,
): signer is WebAuthnAccount {
  return "credential" in signer;
}

export function isSignerClient(
  signer: LocalAccount | WebAuthnAccount | SignerClient,
): signer is SignerClient {
  return "request" in signer;
}
