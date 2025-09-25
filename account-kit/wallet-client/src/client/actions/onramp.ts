export type OnrampParams = {
  token?: string;
  network?: string;
};

export type OnrampResult = {
  success: boolean;
};

/**
 * Opens the funding modal to onramp tokens
 *
 * @param {OnrampParams} params - The parameters for the onramp action
 * @returns {Promise<OnrampResult>} Promise that resolves when the modal is opened
 */
export async function onramp(params?: OnrampParams): Promise<OnrampResult> {
  const { token = "USDC", network = "ethereum" } = params || {};

  // This will be handled by the React component using the useFundingModal hook
  // The actual implementation will dispatch an event that the React component listens to
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("alchemykit:openFundingModal", {
        detail: { token, network },
      }),
    );
  }

  return { success: true };
}
