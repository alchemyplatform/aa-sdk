import { useAuthModal } from "../../hooks/useAuthModal.js";
import { useUiConfig } from "../../hooks/useUiConfig.js";
import { Dialog } from "../dialog/dialog.js";
import { AuthCardContent } from "./card/index.js";

export const AuthModal = () => {
  const { modalBaseClassName } = useUiConfig(({ modalBaseClassName }) => ({
    modalBaseClassName,
  }));
  const { isOpen, closeAuthModal } = useAuthModal();

  return (
    <Dialog isOpen={isOpen} onClose={closeAuthModal}>
      <div
        className={`modal md:w-[368px] ${
          modalBaseClassName ?? ""
        } overflow-hidden`}
      >
        <AuthCardContent showClose />
      </div>
    </Dialog>
  );
};
