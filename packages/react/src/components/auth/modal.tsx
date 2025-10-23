import { useEffect, useRef } from "react";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { useUiConfig } from "../../hooks/useUiConfig.js";
import { Dialog } from "../dialog/dialog.js";
import { AuthCardContent } from "./card/auth-card.js";
import { useAuthContext } from "./context.js";

/**
 * Renders the Auth Modal component. Must be rendered within an `AlchemyUiProvider`. To customize this modal, use the `ui` prop of the `AlchemyUiProvider`.
 *
 * @returns {React.JSX.Element} The rendered Auth Modal component.
 */
export const AuthModal = () => {
  const { modalBaseClassName } = useUiConfig(
    ({ modalBaseClassName, auth, uiMode = "modal" }) => ({
      modalBaseClassName,
      addPasskeyOnSignup: auth?.addPasskeyOnSignup,
      uiMode,
    }),
  );

  const { isOpen, closeAuthModal } = useAuthModal();
  const { resetAuthStep } = useAuthContext();

  // Reset the auth step to the initial state when the modal is closed. Aside
  // from generally being better UX, this prevents the modal from getting stuck
  // in the "complete" state after successfully logging in and then
  // disconnecting.
  const previousIsOpen = useRef(isOpen);
  useEffect(() => {
    if (previousIsOpen.current && !isOpen) {
      resetAuthStep();
    }
    previousIsOpen.current = isOpen;
  }, [isOpen, resetAuthStep]);

  return (
    <Dialog isOpen={isOpen} onClose={closeAuthModal}>
      <div
        className={`akui-modal md:w-[368px] ${
          modalBaseClassName ?? ""
        } overflow-hidden`}
      >
        <AuthCardContent showClose />
      </div>
    </Dialog>
  );
};
