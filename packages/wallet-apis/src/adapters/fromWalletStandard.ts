import { BaseError } from "@alchemy/common";
import type { SolanaSigner } from "../types.js";

const SIGN_TRANSACTION = "solana:signTransaction";

/** Minimal structural shape of a wallet-standard account. */
export interface WalletStandardAccount {
  address: string;
  publicKey?: Uint8Array;
  chains?: readonly string[];
  features?: readonly string[];
  [key: string]: unknown;
}

/** Minimal structural shape of a wallet-standard wallet. */
export interface WalletStandardWallet {
  features: { readonly [name: string]: unknown };
}

interface SolanaSignTransactionFeature {
  readonly signTransaction: (
    ...inputs: readonly {
      account: WalletStandardAccount;
      transaction: Uint8Array;
    }[]
  ) => Promise<readonly { signedTransaction: Uint8Array }[]>;
}

function isSolanaSignTransactionFeature(
  feature: unknown,
): feature is SolanaSignTransactionFeature {
  return (
    typeof feature === "object" &&
    feature !== null &&
    "signTransaction" in feature &&
    typeof (feature as { signTransaction?: unknown }).signTransaction ===
      "function"
  );
}

/**
 * Adapts a Wallet Standard wallet into a {@link SolanaSigner}.
 *
 * Works with any wallet that implements the `solana:signTransaction` feature
 * from the Wallet Standard spec (Phantom, Solflare, etc.). No peer dependency
 * required — the interface uses `Uint8Array` directly.
 *
 * For `@solana/wallet-adapter-react` wallets, use {@link fromWalletAdapter}.
 * For `@solana/kit` signers, use {@link fromKitSigner}. For raw Ed25519
 * keypairs, use {@link fromKeypair}.
 *
 * @param {WalletStandardWallet} wallet - The wallet-standard wallet object
 * @param {WalletStandardAccount} account - The account to sign with
 * @returns {SolanaSigner} A SolanaSigner compatible with `createSmartWalletClient`
 */
export function fromWalletStandard(
  wallet: WalletStandardWallet,
  account: WalletStandardAccount,
): SolanaSigner {
  const feature = wallet.features[SIGN_TRANSACTION];

  if (!isSolanaSignTransactionFeature(feature)) {
    throw new BaseError(
      `Wallet does not support the "${SIGN_TRANSACTION}" feature.`,
    );
  }

  if (account.features && !account.features.includes(SIGN_TRANSACTION)) {
    throw new BaseError(
      `Account ${account.address} does not support the "${SIGN_TRANSACTION}" feature.`,
    );
  }

  return {
    address: account.address,
    async signTransaction({ transaction }) {
      const [output] = await feature.signTransaction({ account, transaction });

      if (!output) {
        throw new BaseError("Wallet returned no signed transaction.");
      }

      if (!(output.signedTransaction instanceof Uint8Array)) {
        throw new BaseError("Wallet returned an invalid signed transaction.");
      }

      return output;
    },
  };
}
