import { useCallback } from "react";
import { useNewUserSignupEffect } from "../../hooks/internal/useNewUserSignup.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { useSignerStatus } from "../../hooks/useSignerStatus.js";
import { useUiConfig } from "../../hooks/useUiConfig.js";
import { Dialog } from "../dialog/dialog.js";
import { AuthCardContent } from "./card/index.js";

export const AuthModal = () => {
  const { isConnected } = useSignerStatus();
  const { modalBaseClassName, addPasskeyOnSignup } = useUiConfig(
    ({ modalBaseClassName, auth }) => ({
      modalBaseClassName,
      addPasskeyOnSignup: auth?.addPasskeyOnSignup,
    })
  );

  const { isOpen, closeAuthModal, openAuthModal } = useAuthModal();

  const handleSignup = useCallback(() => {
    if (isConnected && addPasskeyOnSignup && !isOpen) {
      openAuthModal();
    }
  }, [addPasskeyOnSignup, isConnected, isOpen, openAuthModal]);

  useNewUserSignupEffect(handleSignup);

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
