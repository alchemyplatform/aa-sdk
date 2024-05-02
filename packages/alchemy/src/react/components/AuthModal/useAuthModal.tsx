import { type ReactNode, useCallback, useRef } from "react";
import { AlchemyLogo } from "../../icons/alchemy.js";
import { Divider } from "../divider.js";
import { AuthSection } from "./AuthSection.js";
import type { AuthType } from "./types";

export type AuthCardProps = {
  header?: ReactNode;
  // Each section can contain multiple auth types which will be grouped together
  // and separated by an OR divider
  sections?: AuthType[][];
  className?: string;
};

export type ModalProps = {
  className?: string;
};

/**
 * React component containing an Auth view with configured auth methods
 *
 * @param props Card Props
 * @param props.header optional header for the card (default: "Sign in")
 * @param props.sections array of sections, each containing an array of auth types
 * @returns a react component containing the AuthCard
 */
export const AuthCard = ({ header = "Sign in", sections }: AuthCardProps) => {
  return (
    <>
      <div className="modal-box flex flex-col items-center gap-5">
        <h3 className="font-bold text-lg">{header}</h3>
        {sections?.map((section, idx) => {
          return (
            <>
              <AuthSection key={`auth-section-${idx}`} authTypes={section} />
              {idx !== sections.length - 1 ? (
                <Divider key={`divider-${idx}`} />
              ) : null}
            </>
          );
        })}
        <div className="flex flex-col w-full items-center text-xs gap-3">
          <span className="text-fg-tertiary text-center">
            By signing in, you agree to the following{" "}
            <a
              className="text-fg-accent-brand cursor-pointer"
              href="https://www.alchemy.com/terms-conditions/end-user-terms"
            >
              End User Terms
            </a>
          </span>
          <div className="flex flex-row gap-1">
            <span className="text-fg-disabled">powered by</span>
            <AlchemyLogo className="fill-fg-disabled" />
          </div>
        </div>
      </div>
    </>
  );
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
