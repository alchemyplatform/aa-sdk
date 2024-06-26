import { AuthCardContent } from "./card/index.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { Dialog } from "../dialog/dialog.js";
import { useAuthContext } from "./context.js";

type AuthModalProps = {
  open: boolean;
};

export const AuthModal = ({ open }: AuthModalProps) => {
  const { uiConfig } = useAuthContext();
  const { closeAuthModal } = useAuthModal();

  if (!uiConfig) {
    return null;
  }

  return (
    <Dialog isOpen={open} onClose={closeAuthModal}>
      <div className={`modal md:w-[368px] ${uiConfig.modalClassName ?? ""}`}>
        <AuthCardContent showClose />
      </div>
    </Dialog>
  );
};
