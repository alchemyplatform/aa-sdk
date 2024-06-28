import { AuthCardContent } from "./card/index.js";
import { useAuthModal } from "../../hooks/useAuthModal.js";
import { Dialog } from "../dialog/dialog.js";
import { useUiConfig } from "../../hooks/useUiConfig.js";

export const AuthModal = () => {
  const { modalClassName } = useUiConfig();
  const { isOpen, closeAuthModal } = useAuthModal();

  return (
    <Dialog isOpen={isOpen} onClose={closeAuthModal}>
      <div className={`modal md:w-[368px] ${modalClassName ?? ""}`}>
        <AuthCardContent showClose />
      </div>
    </Dialog>
  );
};
