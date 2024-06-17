import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";
import { FocusTrap } from "./focustrap.js";

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

// eslint-disable-next-line jsdoc/require-jsdoc
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

  return isOpen
    ? createPortal(
        <RemoveScroll enabled={isScrollLocked}>
          {/* Overlay */}
          <div
            aria-modal
            role="dialog"
            className="fixed -inset-px bg-black/80 flex items-center justify-center z-[100000] animate-fade-in"
            onClick={handleBackgroundClick}
          >
            <FocusTrap>
              <div className="animate-fade-in animate-slide-up">{children}</div>
            </FocusTrap>
          </div>
        </RemoveScroll>,
        document.body
      )
    : null;
};
