import { ReactNode, useCallback, useRef } from "react";

type AuthType =
  | {
      type: "email";
      showButton: boolean;
    }
  | { type: "passkey" };

type AuthModalProps = {
  header?: ReactNode;
  // Each section can contain multiple auth types which will be grouped together
  // and separated by an OR divider
  sections?: AuthType[][];
};

// TODO: move this into aa-alchemy
export const useAuthModal = ({ header = "Sign in" }: AuthModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const openAuthModal = () => ref.current?.showModal();
  const closeAuthModal = () => ref.current?.close();

  // TODO: use the sections prop to render the auth types
  const AuthModal = useCallback(() => {
    return (
      <dialog ref={ref} className="modal w-[368px]">
        <div className="modal-box flex flex-col items-center gap-5">
          <h3 className="font-bold text-lg">{header}</h3>
          <div className="flex flex-col gap-2 w-full">
            <label className="input">
              <input placeholder="Email"></input>
            </label>
            <button className="btn btn-primary">Continue</button>
          </div>
          {/* divider */}
          <div
            className={`flex flex-row gap-3 w-full items-center text-fg-tertiary`}
          >
            <div className={`h-[1px] bg-static basis-full shrink grow`}></div>
            <p>Or</p>
            <div className={`h-[1px] bg-static basis-full shrink grow`}></div>
          </div>
          <div className="flex flex-col w-full">
            <button className="btn btn-auth grow">Passkey</button>
          </div>
          <div className="flex flex-col w-full items-center text-xs gap-3">
            <span className="text-fg-tertiary text-center">
              By signing in, you agree to the following{" "}
              <a className="text-fg-accent-brand cursor-pointer" href="">
                End User Terms
              </a>
            </span>
            <span className="text-fg-disabled">powered by INSERT_LOGO</span>
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => closeAuthModal()}></div>
      </dialog>
    );
  }, [header]);

  return { openAuthModal, closeAuthModal, AuthModal };
};
