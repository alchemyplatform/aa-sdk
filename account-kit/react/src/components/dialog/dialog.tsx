"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import { FocusTrap } from "./focustrap.js";
import { Transition } from "react-transition-group";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Dialog component that renders a modal dialog.
 *
 * @param {DialogProps} props - The props for the Dialog component.
 * @returns {JSX.Element | null} The rendered Dialog component.
 */
export const Dialog = ({ isOpen, onClose, children }: DialogProps) => {
  const [isScrollLocked, setScrollLocked] = useState(false);

  const handleBackgroundClick = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Has to run in the browser
    setScrollLocked(getComputedStyle(document.body).overflow !== "hidden");
  }, []);

  return createPortal(
    <RemoveScroll enabled={isScrollLocked}>
      {/* Overlay */}
      <Transition in={isOpen} timeout={150} mountOnEnter unmountOnExit>
        {(state) => {
          return (
            <div
              aria-modal
              role="dialog"
              className={`fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-[999999] ${
                state === "exited" && "hidden"
              } ${state === "entered" && "block"}`}
              onClick={handleBackgroundClick}
            >
              <FocusTrap>
                <div
                  className={`max-md:w-screen md:max-w-sm block ${
                    state === "entering" && "animate-slide-up"
                  } ${state === "exiting" && "animate-slide-down"}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {children}
                </div>
              </FocusTrap>
            </div>
          );
        }}
      </Transition>
    </RemoveScroll>,
    document.body
  );
};
