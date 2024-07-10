import { useAlchemyAccountContext } from "../context.js";
import { MissingUiConfigError } from "../errors.js";

/**
 * A hook that returns the open and close functions for the Auth Modal if uiConfig
 * is enabled on the Account Provider
 *
 * @returns an object containing methods for opening or closing the auth modal
 */
export const useAuthModal = () => {
  const { ui } = useAlchemyAccountContext();
  if (ui == null) {
    throw new MissingUiConfigError("useAuthModal");
  }

  return {
    isOpen: ui.isModalOpen,
    openAuthModal: ui.openAuthModal,
    closeAuthModal: ui.closeAuthModal,
  };
};
