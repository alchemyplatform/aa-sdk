import { AuthCard } from "./card/index.js";
import { type AlchemyAccountsUIConfig } from "../../context.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { Dialog } from "../dialog/dialog.js";

type AuthModalProps = {
  hideError?: boolean;
  auth: NonNullable<AlchemyAccountsUIConfig["auth"]>;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const AuthModal = ({ hideError, auth }: AuthModalProps) => {
  const { isModalOpen, closeAuthModal } = useAuthModal();

  return (
    <Dialog isOpen={isModalOpen} onClose={closeAuthModal}>
      <div className="modal w-[368px]">
        <AuthCard
          hideError={hideError}
          header={auth.header}
          sections={auth.sections}
          onAuthSuccess={() => closeAuthModal()}
          showClose
        />
      </div>
    </Dialog>
  );
};
