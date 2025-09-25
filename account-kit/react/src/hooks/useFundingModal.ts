"use client";

import { useCallback } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import {
  setFundingModalOpen,
  watchFundingModalOpen,
} from "../store/fundingModalSlice.js";
import { useSyncExternalStore } from "react";

export type UseFundingModalResult = {
  isOpen: boolean;
  token: string;
  network: string;
  openFundingModal: (token?: string, network?: string) => void;
  closeFundingModal: () => void;
};

/**
 * Hook to manage the funding modal state
 *
 * @returns {UseFundingModalResult} Object containing modal state and control functions
 */
export const useFundingModal = (): UseFundingModalResult => {
  const { config } = useAlchemyAccountContext();

  const fundingModal = useSyncExternalStore(
    watchFundingModalOpen(config),
    () => {
      // @ts-ignore - fundingModal is added to store dynamically
      const state = config.store.getState();
      return (
        (state as any).fundingModal || {
          isOpen: false,
          token: "",
          network: "",
        }
      );
    },
    () => {
      // @ts-ignore - fundingModal is added to store dynamically
      const state = config.store.getState();
      return (
        (state as any).fundingModal || {
          isOpen: false,
          token: "",
          network: "",
        }
      );
    },
  );

  const openFundingModal = useCallback(
    (token: string = "USDC", network: string = "ethereum") => {
      setFundingModalOpen(
        {
          isOpen: true,
          token,
          network,
        },
        config,
      );
    },
    [config],
  );

  const closeFundingModal = useCallback(() => {
    setFundingModalOpen(
      {
        isOpen: false,
        token: "",
        network: "",
      },
      config,
    );
  }, [config]);

  return {
    isOpen: fundingModal.isOpen,
    token: fundingModal.token,
    network: fundingModal.network,
    openFundingModal,
    closeFundingModal,
  };
};
