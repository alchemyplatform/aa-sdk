import { forwardRef } from "react";
import { AuthCard } from "./card/index.js";
import { type AlchemyAccountsUIConfig } from "../../context.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";

type AuthModalProps = {
  hideError?: boolean;
  auth: NonNullable<AlchemyAccountsUIConfig["auth"]>;
};

export const AuthModal = forwardRef<HTMLDialogElement, AuthModalProps>(
  function AuthModal({ hideError, auth }, ref) {
    const { closeAuthModal } = useAuthModal();

    return (
      <dialog
        ref={ref}
        className={`modal overflow-visible relative w-[368px] ${
          auth.className ?? ""
        }`}
      >
        <AuthCard
          hideError={hideError}
          header={auth.header}
          sections={auth.sections}
          illustrationStyle={auth.illustrationStyle}
          onAuthSuccess={() => closeAuthModal()}
          showClose
        />
        <div className="modal-backdrop" onClick={() => closeAuthModal()} />
      </dialog>
    );
  }
);
