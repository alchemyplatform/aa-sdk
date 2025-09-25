import type { AlchemyAccountsConfig } from "@account-kit/core";

export type FundingModalState = {
  isOpen: boolean;
  token: string;
  network: string;
};

/**
 * Sets the funding modal state
 *
 * @param {FundingModalState} state - The new funding modal state
 * @param {AlchemyAccountsConfig} config - The Alchemy accounts configuration
 */
export const setFundingModalOpen = (
  state: FundingModalState,
  config: AlchemyAccountsConfig,
) => {
  // @ts-expect-error - fundingModal is added to store dynamically
  config.store.setState((prevState: any) => ({
    ...prevState,
    fundingModal: state,
  }));
};

/**
 * Watch for changes to the funding modal state
 *
 * @param {AlchemyAccountsConfig} config - The Alchemy accounts configuration
 * @returns {Function} Unsubscribe function
 */
export const watchFundingModalOpen = (config: AlchemyAccountsConfig) => {
  return (callback: () => void) => {
    // @ts-expect-error - fundingModal is added to store dynamically
    return config.store.subscribe(
      ({ fundingModal }: any) => fundingModal,
      callback,
    );
  };
};
