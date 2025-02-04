import { useCallback } from "react";
import { useUiConfig } from "./useUiConfig.js";

export type UseAuthModalResult = {
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

/**
 * A [hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAuthModal.ts) that returns the open and close functions for the Auth Modal if uiConfig
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
 * @returns {UseAuthModalResult} an object containing methods for opening or closing the auth modal. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useAuthModal.ts#L4)
 */
export const useAuthModal = () => {
  const { isOpen, setModalOpen } = useUiConfig(
    ({ isModalOpen, setModalOpen }) => ({ isOpen: isModalOpen, setModalOpen })
  );

  const openAuthModal = useCallback(() => setModalOpen(true), [setModalOpen]);
  const closeAuthModal = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return {
    isOpen,
    openAuthModal,
    closeAuthModal,
  };
};
