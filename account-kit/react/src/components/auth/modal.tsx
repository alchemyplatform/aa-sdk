import { AuthCardContent } from "./card/index.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { Dialog } from "../dialog/dialog.js";
import { useUiConfig } from "../../hooks/useUiConfig.js";

type AuthModalProps = {
  handleAuthSuccess?: () => void;
};
export const AuthModal = ({ handleAuthSuccess }: AuthModalProps) => {
  const { modalBaseClassName } = useUiConfig();
  const { isOpen, closeAuthModal } = useAuthModal();

  return (
    <Dialog isOpen={isOpen} onClose={closeAuthModal}>
      <div className={`modal md:w-[368px] ${modalBaseClassName ?? ""}`}>
        <AuthCardContent handleAuthSuccess={handleAuthSuccess} showClose />
      </div>
    </Dialog>
  );
};
