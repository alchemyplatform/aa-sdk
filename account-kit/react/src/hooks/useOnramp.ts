"use client";

import { useCallback } from "react";
import { useSmartWalletClient } from "./useSmartWalletClient.js";
import { useFundingModal } from "./useFundingModal.js";

export type UseOnrampResult = {
  onramp: (token?: string, network?: string) => Promise<void>;
  isLoading: boolean;
};

/**
 * Hook to trigger the onramp/funding modal
 *
 * @returns {UseOnrampResult} Object containing onramp function and loading state
 *
 * @example
 * ```tsx
 * import { useOnramp } from "@account-kit/react";
 *
 * function BuyCryptoButton() {
 *   const { onramp } = useOnramp();
 *
 *   return (
 *     <button onClick={() => onramp("USDC", "ethereum")}>
 *       Buy USDC
 *     </button>
 *   );
 * }
 * ```
 */
export const useOnramp = (): UseOnrampResult => {
  const client = useSmartWalletClient({});
  const { openFundingModal } = useFundingModal();

  const onramp = useCallback(
    async (token: string = "USDC", network: string = "ethereum") => {
      if (client && "onramp" in client) {
        // Use the wallet client's onramp action if available
        await client.onramp({ token, network });
      } else {
        // Fallback to opening the modal directly
        openFundingModal(token, network);
      }
    },
    [client, openFundingModal],
  );

  return {
    onramp,
    isLoading: false,
  };
};
