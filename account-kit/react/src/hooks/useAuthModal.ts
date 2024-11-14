import { useCallback } from "react";
import { useUiConfig } from "./useUiConfig.js";

export type UseAuthModalResult = {
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

/**
 * A hook that returns the open and close functions for the Auth Modal if uiConfig
 * is enabled on the Account Provider
 *
 * @example
 * ```tsx
 * import { useAuthModal } from "@account-kit/react";
 *
 * const ComponentWithAuthModal = () => {
 *  const { openAuthModal } = useAuthModal();
 *
 *  return (
 *    <div>
 *      <button onClick={openAuthModal}>Login</button>
 *    </div>
 *  );
 * };
 * ```
 *
 * @returns {UseAuthModalResult} an object containing methods for opening or closing the auth modal
 */
export const useAuthModal = () => {
  const { isOpen, setModalOpen } = useUiConfig(
    ({ isModalOpen, setModalOpen }) => ({ isOpen: isModalOpen, setModalOpen })
  );

  const openAuthModal = useCallback(() => setModalOpen(true), [setModalOpen]);
  const closeAuthModal = useCallback(() => {
    console.log("closing modal");
    setModalOpen(false);
  }, [setModalOpen]);

  return {
    isOpen,
    openAuthModal,
    closeAuthModal,
  };
};
