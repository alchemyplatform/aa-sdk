import type { Chain, Client, LocalAccount } from "viem";
import type {
  InnerWalletApiClient,
  InnerSolanaWalletApiClient,
  SignerClient,
  SolanaChainDef,
  SolanaSigner,
  SolanaWalletStandardSigner,
  SolanaTransactionPartialSigner,
  SolanaMessageSigner,
} from "../types.js";
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

export function isSolanaClient(
  client: Client,
): client is InnerSolanaWalletApiClient {
  return client.name === "alchemySolanaSmartWalletClient" && "owner" in client;
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

export function isSolanaChain(chain: Chain): chain is SolanaChainDef {
  return "solanaChainId" in chain;
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

export function isWalletStandardSigner(
  signer: SolanaSigner,
): signer is SolanaWalletStandardSigner {
  return (
    "signTransaction" in signer &&
    typeof signer.signTransaction === "function"
  );
}

export function isTransactionPartialSigner(
  signer: SolanaSigner,
): signer is SolanaTransactionPartialSigner {
  return (
    "signTransactions" in signer &&
    typeof signer.signTransactions === "function"
  );
}

export function isMessageSigner(
  signer: SolanaSigner,
): signer is SolanaMessageSigner {
  return (
    "signMessage" in signer && typeof signer.signMessage === "function"
  );
}
