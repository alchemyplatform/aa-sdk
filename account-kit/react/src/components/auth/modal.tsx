import { AuthCard } from "./card/index.js";
import { type AlchemyAccountsUIConfig } from "../../context.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { Dialog } from "../dialog/dialog.js";

type AuthModalProps = {
  open: boolean;
  hideError?: boolean;
  auth: NonNullable<AlchemyAccountsUIConfig["auth"]>;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const AuthModal = ({ open, hideError, auth }: AuthModalProps) => {
  const { closeAuthModal } = useAuthModal();

  return (
    <Dialog isOpen={open} onClose={closeAuthModal}>
      <div className="modal md:w-[368px]">
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
