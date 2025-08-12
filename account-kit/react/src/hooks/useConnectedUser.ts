"use client";

import { getUser, watchUser } from "@account-kit/core";
import type { User } from "@account-kit/signer";
import { useMemo, useSyncExternalStore } from "react";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import { useSolanaWallet } from "./useSolanaWallet.js";
import { type Address } from "viem";

export type ConnectedUser = Omit<User, "address"> & {
  address?: Address;
};
export type UseConnectedUserResult =
  | (ConnectedUser & { type: "eoa" | "sca" })
  | null;

/**
 * A React hook that returns the currently connected user across external wallets (EVM or Solana)
 * or the smart account user from the client store. It prioritizes the EVM wallet connection, then
 * Solana, and finally the smart account user.
 *
 * Useful for building UI that needs a single "connected user" concept regardless of whether a
 * smart account session exists.
 *
 * - If an EVM wallet is connected, returns `{ address, orgId, userId, type: "eoa" }`.
 * - If a Solana wallet is connected, returns `{ solanaAddress, orgId, userId, type: "eoa" }` and
 *   `address` may be undefined.
 * - Otherwise, returns the smart account user from the store with `type: "sca"`, or `null` if no
 *   user exists.
 *
 * @returns {UseConnectedUserResult} The connected user, or `null` if no user is available. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useConnectedUser.ts)
 *
 * @example
 * ```ts twoslash
 * import { useConnectedUser } from "@account-kit/react";
 *
 * const user = useConnectedUser();
 *
 * if (user?.type === "eoa") {
 *   // EVM wallets expose `address`; Solana wallets expose `solanaAddress`.
 *   console.log("Connected EOA:", user.address ?? user.solanaAddress);
 * }
 * ```
 */
export function useConnectedUser(): UseConnectedUserResult {
  const { config } = useAlchemyAccountContext();
  const {
    _internal: { wagmiConfig },
  } = config;

  const account = wagmi_useAccount({ config: wagmiConfig });
  const { connected: solanaConnected, publicKey: solanaPublicKey } =
    useSolanaWallet();
  const user = useSyncExternalStore(
    watchUser(config),
    () => getUser(config) ?? null,
    () => getUser(config) ?? null,
  );

  const eoaUser = useMemo(() => {
    if (account.status !== "connected" && account.status !== "reconnecting") {
      return null;
    }

    if (!account.address) {
      return null;
    }

    return {
      address: account.address,
      orgId: account.address,
      userId: account.address,
      type: "eoa" as const,
    };
  }, [account.address, account.status]);

  const solanaEoaUser = useMemo(() => {
    if (!solanaConnected || !solanaPublicKey) {
      return null;
    }

    const solanaAddress = solanaPublicKey.toBase58();

    return {
      solanaAddress,
      orgId: solanaAddress,
      userId: solanaAddress,
      type: "eoa" as const,
    };
  }, [solanaConnected, solanaPublicKey]);

  if (eoaUser) return eoaUser;
  if (solanaEoaUser) return solanaEoaUser;

  return user;
}
