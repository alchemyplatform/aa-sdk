import { useCallback, useRef } from "react";
import { type AuthCardProps, AuthCard } from "../card/index.js";

export type ModalProps = {
  className?: string;
};

/**
 * A hook that allows you to render the Auth Card as a Modal instead of embedded component
 *
 * @param props Card Props
 * @param props.header optional header for the card (default: "Sign in")
 * @param props.sections array of sections, each containing an array of auth types
 * @returns an object containing the openAuthModal, closeAuthModal, and AuthModal component
 */
export const useAuthModal = ({
  header = "Sign in",
  sections,
}: AuthCardProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const openAuthModal = () => ref.current?.showModal();
  const closeAuthModal = () => ref.current?.close();

  const AuthModal = useCallback(
    ({ className }: ModalProps) => {
      return (
        <dialog ref={ref} className={`modal w-[368px] ${className}`}>
          <AuthCard header={header} sections={sections} />
          <div
            className="modal-backdrop"
            onClick={() => closeAuthModal()}
          ></div>
        </dialog>
      );
    },
    [header, sections]
  );

  return { openAuthModal, closeAuthModal, AuthModal };
};
