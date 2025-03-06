import { useCallback } from "react";
import { useNewUserSignup } from "../../hooks/internal/useNewUserSignup.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { useUiConfig } from "../../hooks/useUiConfig.js";
import { useSignerStatus } from "../../hooks/useSignerStatus.js";
import { Dialog } from "../dialog/dialog.js";
import { AuthCardContent } from "./card/index.js";
import { useAuthContext } from "./context.js";

export const AuthModal = () => {
  const { isConnected } = useSignerStatus();
  const { modalBaseClassName, addPasskeyOnSignup } = useUiConfig(
    ({ modalBaseClassName, auth }) => ({
      modalBaseClassName,
      addPasskeyOnSignup: auth?.addPasskeyOnSignup,
    })
  );

  const { setAuthStep, authStep } = useAuthContext();
  const { isOpen, closeAuthModal, openAuthModal } = useAuthModal();

  const handleSignup = useCallback(() => {
    if (addPasskeyOnSignup) {
      openAuthModal();
      setAuthStep({
        type: "passkey_create",
      });
    }
  }, [addPasskeyOnSignup, openAuthModal, setAuthStep]);
  useNewUserSignup(
    handleSignup,
    isConnected &&
      (authStep.type === "complete" || authStep.type === "initial") &&
      !isOpen
  );

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
