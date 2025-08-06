"use client";

import { getUser, watchUser } from "@account-kit/core";
import type { User } from "@account-kit/signer";
import { useMemo, useSyncExternalStore } from "react";
import { useAccount as wagmi_useAccount } from "wagmi";
import { useSolanaWallet } from "./useSolanaWallet.js";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

export type UseUserResult = (User & { type: "eoa" | "sca" }) | null;

/**
 * A React [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useUser.ts) that returns the current user information, either from an External Owned Account (EOA) or from the client store. It uses the Alchemy account context and synchronizes with external store updates.
 * The best way to check if user is logged in for both smart account contract users and EOA.
 *
 * If using smart contract account, returns address of the signer. If only using smart account contracts then you can use [useSignerStatus](https://www.alchemy.com/docs/wallets/reference/account-kit/react/hooks/useSignerStatus#usesignerstatus) or [useAccount](https://www.alchemy.com/docs/wallets/reference/account-kit/react/hooks/useAccount#useaccount) to see if the account is defined.
 *
 * @returns {UseUserResult} The user information, including address, orgId, userId, and type. If the user is not connected, it returns null. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useUser.ts#L9)
 *
 * @example
 * ```ts twoslash
 * import { useUser } from "@account-kit/react";
 * import type { User } from "@account-kit/signer";
 * type UseUserResult  = (User & { type: "eoa" | "sca" }) | null;
 *
 * const user = useUser();
 *
 * ```
 */

export const useUser = (): UseUserResult => {
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
      // for backwards compat
      // TODO: when we upgrade to v4 we should fix this with a breaking change
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
      // Use solana address as a fallback for address field for backwards compatibility
      address: solanaAddress as `0x${string}`,
      solanaAddress,
      orgId: solanaAddress,
      userId: solanaAddress,
      type: "eoa" as const,
    };
  }, [solanaConnected, solanaPublicKey]);

  // Prioritize EVM wallet connection, then Solana, then smart account
  if (eoaUser) return eoaUser;
  if (solanaEoaUser) return solanaEoaUser;

  return user;
};
